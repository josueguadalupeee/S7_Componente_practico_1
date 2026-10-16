# Verificación de requisitos

Esta guía corresponde al código de las cinco mejoras. Ejecuta los comandos del README sobre la rama que contiene la serie completa o después de fusionarla.

## Matriz técnica

| Requisito | Código o evidencia |
| --- | --- |
| SPA con /, /registro y /lista | frontend/src/App.jsx y prueba E2E de navegación |
| Enrutador y componentes reutilizables | BrowserRouter; Menu, FormularioIdea, TarjetaIdea y Mensaje |
| Estado React y campos obligatorios | FormularioIdea.jsx y pruebas de validación y formulario |
| Email, fecha real no futura, categoría e inversión | Validadores de cliente y servidor; pruebas de casos válidos e inválidos |
| POST y GET con fetch | frontend/src/api.js; prueba E2E con la API real |
| Carga, vacío, confirmación, error y reintento | Lista.jsx, FormularioIdea.jsx y pruebas E2E |
| Actualización después de registrar | Navegación a /lista y nueva consulta tras recibir 201 |
| Interfaz adaptable y navegación | index.css; prueba y capturas a 375 px |
| GET y POST /registros con JSON | backend/src/routes/registros.js y pruebas HTTP |
| UUID y estados 200/201/400 | Rutas y pruebas de creación y rechazo |
| Errores de archivo sin detener la API | Prueba con JSON corrupto y fallo de escritura simulado |
| CORS entre orígenes | app.js y prueba HTTP con encabezado Origin |
| Separación de responsabilidades y conexión de API | routes, validations, services; api.js y README |
| Archivo persistente e inicialización [] | archivo.js; pruebas con carpeta y archivo inexistentes |
| Conservar registros previos | Publicaciones secuenciales y 40 publicaciones simultáneas |
| Persistencia al reiniciar | Prueba que detiene y arranca dos procesos sobre el mismo archivo |
| Exclusividad de temática | Confirmar fuera del repositorio en el registro de la asignatura |

## Demostración manual con datos aislados

1. En una terminal PowerShell, entra en backend. Define una ubicación de demostración para proteger los registros del proyecto:

   ```powershell
   $env:REGISTROS_FILE = Join-Path $env:TEMP ('micro-ideas-demo-' + [guid]::NewGuid() + '/registros.json')
   npm start
   ```

2. Inicia el frontend en otra terminal con los valores predeterminados. Abre http://localhost:5173 y navega entre las tres rutas. La lista debe aparecer vacía.
3. Intenta enviar el formulario vacío, con email inválido, fecha futura o inversión mayor que 500. Debe mostrar errores sin realizar un POST; puedes observarlo en la pestaña Red del navegador.
4. Publica una idea válida. Debe responder POST /registros con 201, navegar a /lista, realizar GET /registros con 200 y mostrar la nueva tarjeta con confirmación.
5. Publica otra idea y comprueba que aparecen ambas. Consulta la ruta indicada por REGISTROS_FILE para verificar que contiene una lista JSON con dos registros e IDs distintos.
6. Detén solo el backend con Ctrl+C y vuelve a ejecutar npm start en la misma terminal, conservando REGISTROS_FILE. Recarga /lista: ambas ideas deben seguir disponibles.
7. Con el backend detenido, recarga /lista y comprueba el mensaje de error. Arranca el backend y pulsa Reintentar.
8. En las herramientas del navegador, activa un ancho de 375 px y revisa inicio, formulario y lista. La navegación debe seguir disponible sin desplazamiento horizontal.

## Qué automatizan las pruebas

- Backend: 8 pruebas con archivos temporales. La prueba de escritura simula un error de renombrado y verifica el original, la limpieza de temporales y una operación posterior correcta.
- Validación frontend: 3 pruebas, incluyendo compatibilidad con las reglas del servidor y campos ausentes.
- Chromium: 7 pruebas para flujo real, validación, estados, errores HTTP, desconexión, bloqueo de envíos repetidos y diseño móvil.
- Compilación de producción: npm run build.

Las pruebas no editan backend/data/registros.json. La prueba de persistencia reinicia procesos reales. La resistencia a solicitudes simultáneas corresponde a una sola instancia del backend; no demuestra coordinación entre procesos ni tolerancia a una pérdida eléctrica.
