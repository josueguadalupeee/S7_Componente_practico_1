// Arranque separado de la configuración de Express para facilitar la verificación.
const app = require('./app');
const PUERTO = process.env.PORT || 3001;
const servidor = app.listen(PUERTO, () => {
  console.log('Servidor de Micro-Ideas escuchando en http://localhost:' + servidor.address().port);
});
