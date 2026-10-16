// Formulario controlado para publicar una idea nueva
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { crearIdea } from '../api.js';
import { hoyComoTexto, validarCampo, validarFormulario } from '../utils/validaciones.js';
import { CATEGORIAS } from '../utils/categorias.js';
import Mensaje from './Mensaje.jsx';

// Estado inicial: un objeto con todos los campos vacíos
const IDEA_VACIA = {
  nombre: '',
  email: '',
  titulo: '',
  descripcion: '',
  fecha: '',
  categoria: '',
  inversion: '',
};

function FormularioIdea() {
  const [datos, setDatos] = useState(IDEA_VACIA);
  const [errores, setErrores] = useState({});           // errores por campo (cliente)
  const [erroresServidor, setErroresServidor] = useState([]); // errores que devuelve la API (400)
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [errorConexion, setErrorConexion] = useState('');

  // Actualiza el campo que cambió usando su atributo "name"
  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setDatos({ ...datos, [name]: value });
    // Si el campo ya tenía error, lo revalidamos para que desaparezca al corregirlo
    if (errores[name]) {
      setErrores({ ...errores, [name]: validarCampo(name, value) });
    }
  }

  // Valida un campo cuando el usuario sale de él
  function manejarSalida(evento) {
    const { name, value } = evento.target;
    setErrores({ ...errores, [name]: validarCampo(name, value) });
  }

  async function manejarEnvio(evento) {
    evento.preventDefault(); // evita que el navegador recargue la página
    setExito(false);
    setErroresServidor([]);
    setErrorConexion('');

    // 1. Validar en el cliente: si hay errores, NO se envía
    const nuevosErrores = validarFormulario(datos);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    // 2. Enviar a la API
    setEnviando(true);
    try {
      const { ok, datos: respuesta } = await crearIdea({
        ...datos,
        inversion: Number(datos.inversion), // la API espera un número
      });

      if (ok) {
        // 201: éxito → limpiamos el formulario
        setExito(true);
        setDatos(IDEA_VACIA);
        setErrores({});
      } else {
        // 400 (u otro): mostramos lo que dijo el servidor
        setErroresServidor(respuesta.errores || [respuesta.error || 'El servidor rechazó la idea']);
      }
    } catch (error) {
      setErrorConexion(error.message);
    } finally {
      setEnviando(false);
    }
  }

  // Pequeña ayuda para no repetir el mismo bloque de error en cada campo
  function errorDe(campo) {
    return errores[campo] ? <p className="campo__error">{errores[campo]}</p> : null;
  }

  // Clase CSS del campo: se marca en rojo si tiene error
  function claseDe(campo) {
    return errores[campo] ? 'campo campo--invalido' : 'campo';
  }

  return (
    <form className="formulario" onSubmit={manejarEnvio} noValidate>
      {exito && (
        <Mensaje tipo="exito">
          ¡Tu idea fue publicada! <Link to="/lista">Ver la lista de ideas →</Link>
        </Mensaje>
      )}

      {erroresServidor.length > 0 && (
        <Mensaje tipo="error">
          <strong>El servidor encontró errores:</strong>
          <ul>
            {erroresServidor.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </Mensaje>
      )}

      {errorConexion && <Mensaje tipo="error">{errorConexion}</Mensaje>}

      <div className="formulario__fila">
        <div className={claseDe('nombre')}>
          <label htmlFor="nombre">Tu nombre</label>
          <input id="nombre" name="nombre" type="text" value={datos.nombre}
            onChange={manejarCambio} onBlur={manejarSalida} placeholder="Ej. María López" />
          {errorDe('nombre')}
        </div>

        <div className={claseDe('email')}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={datos.email}
            onChange={manejarCambio} onBlur={manejarSalida} placeholder="nombre@correo.com" />
          {errorDe('email')}
        </div>
      </div>

      <div className={claseDe('titulo')}>
        <label htmlFor="titulo">Título de la idea</label>
        <input id="titulo" name="titulo" type="text" value={datos.titulo} maxLength={80}
          onChange={manejarCambio} onBlur={manejarSalida} placeholder="Ej. Venta de bolones a domicilio" />
        {errorDe('titulo')}
      </div>

      <div className={claseDe('descripcion')}>
        <label htmlFor="descripcion">Descripción</label>
        <textarea id="descripcion" name="descripcion" rows={5} value={datos.descripcion} maxLength={500}
          onChange={manejarCambio} onBlur={manejarSalida}
          placeholder="¿Qué vas a vender u ofrecer? ¿A quién? ¿Cómo lo harás?" />
        <p className="campo__contador">{datos.descripcion.trim().length} / 500</p>
        {errorDe('descripcion')}
      </div>

      <div className="formulario__fila formulario__fila--tres">
        <div className={claseDe('fecha')}>
          <label htmlFor="fecha">Fecha</label>
          <input id="fecha" name="fecha" type="date" value={datos.fecha} max={hoyComoTexto()}
            onChange={manejarCambio} onBlur={manejarSalida} />
          {errorDe('fecha')}
        </div>

        <div className={claseDe('categoria')}>
          <label htmlFor="categoria">Categoría</label>
          <select id="categoria" name="categoria" value={datos.categoria}
            onChange={manejarCambio} onBlur={manejarSalida}>
            <option value="">Selecciona…</option>
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
          {errorDe('categoria')}
        </div>

        <div className={claseDe('inversion')}>
          <label htmlFor="inversion">Inversión (USD)</label>
          <input id="inversion" name="inversion" type="number" min="1" max="500" step="0.01"
            value={datos.inversion} onChange={manejarCambio} onBlur={manejarSalida} placeholder="Máx. 500" />
          {errorDe('inversion')}
        </div>
      </div>

      {/* Deshabilitado mientras se envía para evitar registros duplicados */}
      <button type="submit" className="boton" disabled={enviando}>
        {enviando ? 'Enviando…' : 'Publicar idea'}
      </button>
    </form>
  );
}

export default FormularioIdea;
