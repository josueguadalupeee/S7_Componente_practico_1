// Página de consulta de ideas (ruta /lista)
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { obtenerIdeas } from '../api.js';
import { CATEGORIAS, ICONOS } from '../utils/categorias.js';
import TarjetaIdea from '../components/TarjetaIdea.jsx';
import Mensaje from '../components/Mensaje.jsx';

function Lista() {
  const { state } = useLocation();
  const [ideas, setIdeas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('Todas');

  // Pide las ideas al backend y actualiza los estados
  async function cargarIdeas() {
    setCargando(true);
    setError('');
    try {
      const datos = await obtenerIdeas();
      setIdeas(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  // [] = se ejecuta una sola vez, cuando la página se muestra
  useEffect(() => {
    cargarIdeas();
  }, []);

  // El filtro se aplica solo en React, sin volver a pedir datos al servidor
  const ideasFiltradas = filtro === 'Todas' ? ideas : ideas.filter((idea) => idea.categoria === filtro);

  // Contenido según el estado: cargando, error, vacío o lista
  let contenido;
  if (cargando) {
    contenido = <Mensaje tipo="cargando">Cargando ideas…</Mensaje>;
  } else if (error) {
    contenido = (
      <Mensaje tipo="error">
        <p>{error}</p>
        <button type="button" className="boton boton--pequeno" onClick={cargarIdeas}>Reintentar</button>
      </Mensaje>
    );
  } else if (ideas.length === 0) {
    contenido = (
      <div className="vacio">
        <span className="vacio__icono" aria-hidden="true">🌱</span>
        <h2>Aún no hay ideas registradas</h2>
        <p>¡Sé el primero en compartir cómo emprender con menos de $500!</p>
        <Link to="/registro" className="boton">Publicar una idea</Link>
      </div>
    );
  } else if (ideasFiltradas.length === 0) {
    contenido = <Mensaje tipo="info">No hay ideas en la categoría «{filtro}».</Mensaje>;
  } else {
    contenido = (
      <div className="rejilla">
        {ideasFiltradas.map((idea) => (
          <TarjetaIdea key={idea.id} idea={idea} />
        ))}
      </div>
    );
  }

  return (
    <section>
      {state?.registroCreado && (
        <Mensaje tipo="exito">¡Tu idea fue publicada! Ya puedes consultarla en esta lista.</Mensaje>
      )}
      <header className="pagina__cabecera">
        <span className="pagina__etiqueta">Explorar</span>
        <h1>Ideas publicadas</h1>
        {!cargando && !error && (
          <p className="subtitulo">
            {ideasFiltradas.length} {ideasFiltradas.length === 1 ? 'idea' : 'ideas'}
            {filtro !== 'Todas' && ` en ${filtro}`}
          </p>
        )}
      </header>

      {/* Filtro por categoría: un botón (chip) por cada opción */}
      <div className="filtro" role="group" aria-label="Filtrar por categoría">
        {['Todas', ...CATEGORIAS].map((opcion) => (
          <button
            key={opcion}
            type="button"
            className={filtro === opcion ? 'chip chip--activo' : 'chip'}
            aria-pressed={filtro === opcion}
            onClick={() => setFiltro(opcion)}
          >
            {opcion === 'Todas' ? '✨' : ICONOS[opcion]} {opcion}
          </button>
        ))}
      </div>

      {contenido}
    </section>
  );
}

export default Lista;
