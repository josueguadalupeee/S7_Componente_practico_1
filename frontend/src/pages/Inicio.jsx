// Página de bienvenida (ruta /)
import { Link } from 'react-router-dom';
import { CATEGORIAS, ICONOS } from '../utils/categorias.js';

// Pasos de "¿Cómo funciona?" (se recorren con map para no repetir HTML)
const PASOS = [
  { icono: '💡', titulo: 'Comparte tu idea', texto: 'Describe tu negocio y cuánto necesitas para empezar.' },
  { icono: '💵', titulo: 'Máximo $500', texto: 'Solo ideas que se pueden iniciar con poco dinero.' },
  { icono: '🔎', titulo: 'Inspírate', texto: 'Consulta y filtra las ideas de otros estudiantes.' },
];

function Inicio() {
  return (
    <>
      <section className="hero">
        <span className="hero__lema">🚀 Emprende con menos de $500</span>
        <h1 className="hero__titulo">
          Tu próximo negocio no necesita <span className="texto-degradado">mucho dinero</span>
        </h1>
        <p className="hero__texto">
          En <strong>Micro-Ideas</strong> los estudiantes comparten ideas de negocio que se pueden
          iniciar con una inversión de hasta $500. Publica la tuya o descubre la de otros.
        </p>
        <div className="hero__acciones">
          <Link to="/registro" className="boton">Publicar mi idea →</Link>
          <Link to="/lista" className="boton boton--secundario">Explorar ideas</Link>
        </div>

        <div className="hero__categorias">
          {CATEGORIAS.map((categoria) => (
            <span key={categoria} className="chip chip--estatico">
              {ICONOS[categoria]} {categoria}
            </span>
          ))}
        </div>
      </section>

      <section className="pasos">
        <h2 className="seccion__titulo">¿Cómo funciona?</h2>
        <div className="pasos__rejilla">
          {PASOS.map((paso) => (
            <article key={paso.titulo} className="paso">
              <span className="paso__icono" aria-hidden="true">{paso.icono}</span>
              <h3>{paso.titulo}</h3>
              <p>{paso.texto}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default Inicio;
