# Micro-Ideas

SPA para publicar y consultar ideas de emprendimiento con una inversión mayor que USD 0 y de hasta USD 500. El proceso principal es registrar y explorar ideas; no incluye pagos ni autenticación.

## Requisitos

- Node.js 22 o superior y npm.
- Dos terminales para ejecutar frontend y backend.
- Una sola instancia del backend por archivo JSON. La exclusividad de la temática debe confirmarse en el registro de la asignatura.

## Ejecutar localmente

Clona el repositorio y abre una terminal en su carpeta. En la primera terminal:

```sh
cd backend
npm ci
npm start
```

La API escucha en http://localhost:3001. Para desarrollo con reinicio automático utiliza `npm run dev`.

En la segunda terminal, desde la raíz del repositorio:

```sh
cd frontend
npm ci
npm run dev
```

Abre http://localhost:5173. Si ese puerto está ocupado, Vite anuncia el puerto disponible en la terminal.

| Ruta de React | Uso |
| --- | --- |
| / | Bienvenida y navegación |
| /registro | Formulario controlado para publicar una idea |
| /lista | Consulta de la API, tarjetas y filtro por categoría |

Para compilar el frontend ejecuta `npm run build` dentro de `frontend`. `npm run preview` permite revisar la compilación localmente. Un alojamiento de producción debe devolver `index.html` también al abrir directamente `/registro` o `/lista`, porque la aplicación usa BrowserRouter.

## Dirección de la API

`frontend/src/api.js` centraliza las solicitudes fetch. Usa `VITE_API_URL` o, por defecto, `http://localhost:3001`, y agrega `/registros`.

Para cambiarla, copia `frontend/.env.example` como `frontend/.env`, edita el valor y reinicia Vite. En una compilación debes definirla antes de `npm run build`. No agregues una barra final. Esta variable se incluye en el código público del navegador y no debe contener contraseñas ni tokens.

El backend lee `PORT` del entorno (3001 por defecto) y configura CORS para permitir las peticiones desde el frontend en otro origen. Por ejemplo, en PowerShell, dentro de `backend`:

```powershell
$env:PORT = '3002'
npm start
```

Si cambias el puerto de la API, actualiza también `VITE_API_URL`.

## API y validaciones

| Método y ruta | Respuesta |
| --- | --- |
| GET / | 200, mensaje de disponibilidad |
| GET /registros | 200, lista de ideas con las más recientes primero |
| POST /registros | 201 y el registro creado; 400 y un array de errores si los datos son inválidos |

Los cuerpos de las peticiones y respuestas usan JSON. Un POST válido contiene:

```json
{
  "nombre": "Persona de ejemplo",
  "email": "persona@example.test",
  "titulo": "Reparación de bicicletas",
  "descripcion": "Servicio de reparación de bicicletas para estudiantes del campus.",
  "fecha": "2026-01-01",
  "categoria": "Servicios",
  "inversion": 80
}
```

Todos los campos son obligatorios. El nombre debe tener al menos 3 caracteres; el título, entre 5 y 80; la descripción, entre 20 y 500. El email debe tener formato válido. La fecha debe existir, tener formato YYYY-MM-DD y no ser futura. Las categorías permitidas son Comida, Tecnología, Servicios, Manualidades, Comercio y Educación. La inversión debe ser un número mayor que 0 y menor o igual a 500.

El servidor vuelve a validar todos los datos, elimina espacios extremos y genera `id` con `crypto.randomUUID()` y `creadoEn` con la fecha y hora de creación. Los IDs identifican registros; no son tokens de acceso. Las rutas desconocidas devuelven 404, el JSON mal formado devuelve 400 y los errores de archivo devuelven 500 sin terminar el servidor.

## Componentes y flujo

1. `FormularioIdea` mantiene los campos en estado React, valida antes de enviar y bloquea nuevos envíos mientras espera.
2. `crearIdea` envía un POST JSON a la API. Los errores preservan el formulario para corregirlo o reintentar.
3. Express aplica CORS, interpreta el JSON y delega en `routes/registros.js`.
4. `validations/idea.js` revisa los campos. Si son válidos, la ruta genera el registro y pide al servicio de archivo guardarlo.
5. Tras recibir 201, React navega a `/lista`, muestra la confirmación y hace un GET nuevo.
6. `Lista` presenta carga, error con reintento, lista vacía o componentes `TarjetaIdea`. `Menu` y `Mensaje` se reutilizan entre pantallas.

## Persistencia JSON

Los datos se guardan en `backend/data/registros.json`. La ruta predeterminada es absoluta y no depende del directorio desde el que se ejecute Node. Si el archivo o su carpeta no existen, el servicio los crea e inicializa el archivo con `[]`.

La cola del servicio serializa las consultas y toda la operación de leer, agregar y guardar. Cada escritura utiliza un archivo temporal en la misma carpeta, lo sincroniza y lo renombra sobre el original cuando está completo. Un fallo no deja bloqueada la cola. Un JSON corrupto se conserva y se responde con error para que pueda repararse.

La cola coordina solicitudes dentro de un proceso Node; no coordina varios procesos, réplicas o aplicaciones que escriban el mismo archivo. No edites el JSON manualmente mientras el backend procesa solicitudes.

Para pruebas o una demostración puedes definir `REGISTROS_FILE` con una ruta alternativa. Si es relativa, se resuelve desde el directorio de trabajo del backend. En PowerShell, dentro de `backend`:

```powershell
$env:REGISTROS_FILE = Join-Path $env:TEMP 'micro-ideas-demo/registros.json'
npm start
```

No uses los registros reales para ejecutar pruebas. Las pruebas automatizadas ya generan sus propios archivos temporales.

## Autenticación y datos de contacto

La aplicación permite publicar y consultar sin iniciar sesión, de acuerdo con el alcance académico. No guarda contraseñas, sesiones ni tokens de autenticación. El nombre y el email son datos declarados por el proponente; no se verifica su identidad. El email se devuelve en la API y se muestra como contacto en las tarjetas. CORS no sustituye autenticación ni autorización.

## Verificación

Después de instalar ambos proyectos:

```sh
cd backend
npm test
cd ../frontend
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Las pruebas del backend verifican creación, consulta, validación, errores, persistencia tras reiniciar un proceso, concurrencia y conservación del original si falla una escritura. Las del frontend comprueban las reglas y el flujo en Chromium, incluidos errores, reintento y pantallas de 375 px. Playwright usa los puertos 3003 y 5175 y requiere que estén libres. En Linux puede ser necesario instalar las dependencias del navegador con `npx playwright install --with-deps chromium`.

GitHub Actions ejecuta estas comprobaciones en cada push y pull request. Consulta [la matriz y la demostración manual](docs/VERIFICACION.md) para relacionarlas con la consigna.

## Contribuir

Crea una rama por mejora, haz commits con un propósito claro y abre un pull request indicando el problema, el cambio y cómo lo comprobaste. Ejecuta las pruebas relacionadas antes de solicitar revisión. No incluyas `node_modules`, `dist`, archivos `.env`, reportes de Playwright ni registros producidos durante pruebas. Conserva `backend/data/ejemplos.json` como referencia para demostraciones.
