// Caja de mensaje reutilizable. tipo: 'exito' | 'error' | 'info' | 'cargando'
function Mensaje({ tipo = 'info', children }) {
  // role="alert" hace que los lectores de pantalla anuncien los errores
  const rol = tipo === 'error' ? 'alert' : 'status';

  return (
    <div className={`mensaje mensaje--${tipo}`} role={rol}>
      {tipo === 'cargando' && <span className="mensaje__spinner" aria-hidden="true" />}
      <div>{children}</div>
    </div>
  );
}

export default Mensaje;
