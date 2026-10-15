// Punto de entrada de React: monta la app dentro de <div id="root">
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter habilita la navegación entre rutas sin recargar la página.
        "future" activa el comportamiento de React Router v7 y evita sus advertencias en la consola. */}
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
