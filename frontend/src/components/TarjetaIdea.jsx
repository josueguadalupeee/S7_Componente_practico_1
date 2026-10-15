// Tarjeta que muestra una idea de la lista
import { ICONOS } from '../utils/categorias.js';

// Convierte "2026-10-13" en "13 de octubre de 2026".
// Se arma la fecha con año, mes y día para evitar el desfase de zona horaria.
function formatearFecha(texto) {
  const [anio, mes, dia] = texto.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Muestra "$80" o "$350.50" (sin decimales si el valor es entero, con 2 si no lo es)
function formatearInversion(valor) {
  const numero = Number(valor);
  const decimales = Number.isInteger(numero) ? 0 : 2;
  return `$${numero.toFixed(decimales)}`;
}

function TarjetaIdea({ idea }) {
  // data-categoria permite que el CSS le dé un color distinto a cada categoría
  return (
    <article className="tarjeta" data-categoria={idea.categoria}>
      <div className="tarjeta__cabecera">
        <span className="etiqueta">
          {ICONOS[idea.categoria]} {idea.categoria}
        </span>
        <div className="tarjeta__inversion">
          <small>Inversión</small>
          {formatearInversion(idea.inversion)}
        </div>
      </div>

      <h3 className="tarjeta__titulo">{idea.titulo}</h3>
      <p className="tarjeta__descripcion">{idea.descripcion}</p>

      <footer className="tarjeta__pie">
        {/* Avatar con la inicial del nombre */}
        <span className="avatar" aria-hidden="true">{idea.nombre.charAt(0).toUpperCase()}</span>
        <div className="tarjeta__autor">
          <strong>{idea.nombre}</strong>
          {/* mailto: abre el correo para contactar al proponente */}
          <a href={`mailto:${idea.email}`}>{idea.email}</a>
          <time dateTime={idea.fecha}>{formatearFecha(idea.fecha)}</time>
        </div>
      </footer>
    </article>
  );
}

export default TarjetaIdea;
