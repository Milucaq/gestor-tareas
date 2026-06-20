import { useEffect, useState } from "react";
import { api } from "./api.js";

// Columnas del tablero Kanban (coinciden con el enum 'estado' en MySQL)
const COLUMNAS = [
  { id: "pendiente",   titulo: "Pendiente" },
  { id: "en_proceso",  titulo: "En Proceso" },
  { id: "en_revision", titulo: "En Revision" },
  { id: "finalizado",  titulo: "Finalizado" }
];

const ORDEN_ESTADOS = COLUMNAS.map(c => c.id);

export default function App() {
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSel, setProyectoSel] = useState(null);
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Formularios
  const [nuevoProyecto, setNuevoProyecto] = useState({ nombre: "", descripcion: "" });
  const [nuevaTarea, setNuevaTarea] = useState({ titulo: "", descripcion: "", prioridad: "media" });

  // Carga inicial de proyectos
  useEffect(() => {
    api.listarProyectos()
      .then(data => {
        setProyectos(data);
        if (data.length) setProyectoSel(data[0].id);
      })
      .catch(err => {
        console.error(err);
        alert(err.message);
      });
      .finally(() => setCargando(false));
  }, []);

  // Carga de tareas cuando cambia el proyecto seleccionado
  useEffect(() => {
    if (proyectoSel) api.listarTareas(proyectoSel).then(setTareas).catch(() => {});
  }, [proyectoSel]);

  const recargarTareas = () => api.listarTareas(proyectoSel).then(setTareas);

  // --- Acciones de proyectos ---
  const crearProyecto = async () => {
    if (!nuevoProyecto.nombre.trim()) return;
    await api.crearProyecto(nuevoProyecto);
    setNuevoProyecto({ nombre: "", descripcion: "" });
    const data = await api.listarProyectos();
    setProyectos(data);
  };

  // --- Acciones de tareas ---
  const crearTarea = async () => {
    if (!nuevaTarea.titulo.trim() || !proyectoSel) return;
    await api.crearTarea({ ...nuevaTarea, proyecto_id: proyectoSel });
    setNuevaTarea({ titulo: "", descripcion: "", prioridad: "media" });
    recargarTareas();
  };

  const moverTarea = async (tarea, direccion) => {
    const idx = ORDEN_ESTADOS.indexOf(tarea.estado);
    const nuevo = ORDEN_ESTADOS[idx + direccion];
    if (!nuevo) return;
    await api.editarTarea(tarea.id, { ...tarea, estado: nuevo });
    recargarTareas();
  };

  const borrarTarea = async (id) => {
    await api.borrarTarea(id);
    recargarTareas();
  };

  if (cargando) return <div className="estado-vacio">Cargando…</div>;

  return (
    <div className="app">
      <header className="cabecera">
        <h1>Gestor de Tareas y Proyectos</h1>
        <p>Tablero Kanban · Scrum · Full Stack</p>
      </header>

      <main className="contenedor">
        {/* Panel lateral: proyectos y formularios */}
        <aside className="panel">
          <section className="bloque">
            <h2>Proyectos</h2>
            <ul className="lista-proyectos">
              {proyectos.map(p => (
                <li
                  key={p.id}
                  className={p.id === proyectoSel ? "activo" : ""}
                  onClick={() => setProyectoSel(p.id)}
                >
                  <span>{p.nombre}</span>
                  <small>{p.total_tareas} tareas</small>
                </li>
              ))}
              {!proyectos.length && <li className="vacio">Sin proyectos aun</li>}
            </ul>
          </section>

          <section className="bloque">
            <h2>Nuevo proyecto</h2>
            <input
              placeholder="Nombre del proyecto"
              value={nuevoProyecto.nombre}
              onChange={e => setNuevoProyecto({ ...nuevoProyecto, nombre: e.target.value })}
            />
            <textarea
              placeholder="Descripcion"
              value={nuevoProyecto.descripcion}
              onChange={e => setNuevoProyecto({ ...nuevoProyecto, descripcion: e.target.value })}
            />
            <button onClick={crearProyecto}>Crear proyecto</button>
          </section>

          <section className="bloque">
            <h2>Nueva tarea</h2>
            <input
              placeholder="Titulo de la tarea"
              value={nuevaTarea.titulo}
              onChange={e => setNuevaTarea({ ...nuevaTarea, titulo: e.target.value })}
            />
            <textarea
              placeholder="Descripcion"
              value={nuevaTarea.descripcion}
              onChange={e => setNuevaTarea({ ...nuevaTarea, descripcion: e.target.value })}
            />
            <select
              value={nuevaTarea.prioridad}
              onChange={e => setNuevaTarea({ ...nuevaTarea, prioridad: e.target.value })}
            >
              <option value="baja">Prioridad baja</option>
              <option value="media">Prioridad media</option>
              <option value="alta">Prioridad alta</option>
            </select>
            <button onClick={crearTarea} disabled={!proyectoSel}>Agregar tarea</button>
          </section>
        </aside>

        {/* Tablero Kanban */}
        <section className="tablero">
          {COLUMNAS.map(col => {
            const items = tareas.filter(t => t.estado === col.id);
            return (
              <div className="columna" key={col.id}>
                <div className="columna-cabecera">
                  <h3>{col.titulo}</h3>
                  <span className="contador">{items.length}</span>
                </div>
                <div className="columna-cuerpo">
                  {items.map(t => (
                    <article className={`tarjeta prioridad-${t.prioridad}`} key={t.id}>
                      <h4>{t.titulo}</h4>
                      {t.descripcion && <p>{t.descripcion}</p>}
                      <div className="tarjeta-meta">
                        <span className="etiqueta">{t.prioridad}</span>
                        {t.responsable && <span className="responsable">{t.responsable}</span>}
                      </div>
                      <div className="tarjeta-acciones">
                        <button onClick={() => moverTarea(t, -1)} title="Mover atras">←</button>
                        <button onClick={() => moverTarea(t, 1)} title="Mover adelante">→</button>
                        <button className="borrar" onClick={() => borrarTarea(t.id)} title="Eliminar">✕</button>
                      </div>
                    </article>
                  ))}
                  {!items.length && <div className="columna-vacia">Sin tareas</div>}
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
