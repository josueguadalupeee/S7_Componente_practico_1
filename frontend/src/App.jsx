// Componente raíz: muestra el menú y decide qué página mostrar según la URL
import { Routes, Route } from 'react-router-dom';
import Menu from './components/Menu.jsx';
import Inicio from './pages/Inicio.jsx';
import Registro from './pages/Registro.jsx';
import Lista from './pages/Lista.jsx';

function App() {
  return (
    <>
      <Menu />
      <main className="contenedor">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/lista" element={<Lista />} />
          {/* Cualquier otra URL muestra el inicio */}
          <Route path="*" element={<Inicio />} />
        </Routes>
      </main>
      <footer className="pie">Micro-Ideas · Todos los derechos reservados</footer>
    </>
  );
}

export default App;
