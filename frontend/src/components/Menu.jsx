// Barra de navegación visible en todas las páginas
import { NavLink } from 'react-router-dom';

function Menu() {
  return (
    <header className="menu">
      <div className="menu__interior">
        <NavLink to="/" className="menu__marca">
          <span className="menu__logo" aria-hidden="true">$</span>
          <span>Micro<span className="menu__marca-acento">-Ideas</span></span>
        </NavLink>
        {/* NavLink agrega la clase "active" al enlace de la página actual */}
        <nav className="menu__enlaces">
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/lista">Ver ideas</NavLink>
          <NavLink to="/registro" className="menu__cta">Publicar idea</NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Menu;
