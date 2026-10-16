// Página para publicar una idea (ruta /registro)
import FormularioIdea from '../components/FormularioIdea.jsx';

function Registro() {
  return (
    <section>
      <header className="pagina__cabecera">
        <span className="pagina__etiqueta">Nueva idea</span>
        <h1>Publica tu idea de negocio</h1>
        <p className="subtitulo">Todos los campos son obligatorios. La inversión debe ser de máximo $500.</p>
      </header>

      <div className="registro">
        <FormularioIdea />

        {/* Panel lateral con consejos (en celular se muestra debajo del formulario) */}
        <aside className="consejos">
          <h2>💡 Consejos</h2>
          <ul>
            <li><strong>Título claro:</strong> di qué vendes u ofreces en pocas palabras.</li>
            <li><strong>Descripción concreta:</strong> a quién va dirigido y cómo lo harás.</li>
            <li><strong>Inversión realista:</strong> suma materiales, herramientas y publicidad.</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}

export default Registro;
