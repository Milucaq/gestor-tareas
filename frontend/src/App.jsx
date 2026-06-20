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
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [nuevoProyecto, setNuevoProyecto] = useState({ nombre: "", descripcion: "" });
  const [nuevaTarea, setNuevaTarea] = useState({ titulo: "", descripcion: "", prioridad: "media", responsable_id: "", fecha_limite: "" });

  // Estados para edicion (modales) e historial
  const [editProyecto, setEditProyecto] = useState(null);
  const [editTarea, setEditTarea] = useState(null);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    api.listarProyectos()
      .then(data => { setProyectos(data); if (data.length) setProyectoSel(data[0].id); })
      .catch(() => {})
      .finally(() => setCargando(false));
    api.listarUsuarios().then(setUsuarios).catch(() => {});
  }, []);

  useEffect(() => {
    if (proyectoSel) api.listarTareas(proyectoSel).then(setTareas).catch(() => {});
  }, [proyectoSel]);

  const recargarTareas = () => api.listarTareas(proyectoSel).then(setTareas);
  const recargarProyectos = () => api.listarProyectos().then(setProyectos);

  // ---------- Proyectos ----------
  const crearProyecto = async () => {
    if (!nuevoProyecto.nombre.trim()) return;
    await api.crearProyecto(nuevoProyecto);
    setNuevoProyecto({ nombre: "", descripcion: "" });
    recargarProyectos();
  };

  const guardarProyecto = async () => {
    await api.editarProyecto(editProyecto.id, {
      nombre: editProyecto.nombre,
      descripcion: editProyecto.descripcion,
      estado: editProyecto.estado,
      fecha_inicio: editProyecto.fecha_inicio,
      fecha_fin: editProyecto.fecha_fin,
      responsable_id: editProyecto.responsable_id
    });
    setEditProyecto(null);
    recargarProyectos();
  };

  const eliminarProyecto = async (id) => {
    if (!window.confirm("¿Eliminar este proyecto y todas sus tareas?")) return;
    await api.borrarProyecto(id);
    setEditProyecto(null);
    const data = await api.listarProyectos();
    setProyectos(data);
    if (proyectoSel === id) setProyectoSel(data[0]?.id || null);
  };

  // ---------- Tareas ----------
  const crearTarea = async () => {
    if (!nuevaTarea.titulo.trim() || !proyectoSel) return;
    await api.crearTarea({
      ...nuevaTarea,
      proyecto_id: proyectoSel,
      responsable_id: nuevaTarea.responsable_id || null,
      fecha_limite: nuevaTarea.fecha_limite || null
    });
    setNuevaTarea({ titulo: "", descripcion: "", prioridad: "media", responsable_id: "", fecha_limite: "" });
    recargarTareas();
  };

  const abrirEdicionTarea = async (tarea) => {
    setEditTarea({ ...tarea, responsable_id: tarea.responsable_id || "", fecha_limite: tarea.fecha_limite || "" });
    setHistorial([]);
    try { setHistorial(await api.listarHistorial(tarea.id)); } catch { /* sin historial */ }
  };

  const guardarTarea = async () => {
    await api.editarTarea(editTarea.id, {
      titulo: editTarea.titulo,
      descripcion: editTarea.descripcion,
      estado: editTarea.estado,
      prioridad: editTarea.prioridad,
      responsable_id: editTarea.responsable_id || null,
      fecha_limite: editTarea.fecha_limite || null
    });
    setEditTarea(null);
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
    if (!window.confirm("¿Eliminar esta tarea?")) return;
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
        <aside className="panel">
          <section className="bloque">
            <h2>Proyectos</h2>
            <ul className="lista-proyectos">
              {proyectos.map(p => (
                <li key={p.id} className={p.id === proyectoSel ? "activo" : ""}>
                  <div className="proyecto-info" onClick={() => setProyectoSel(p.id)}>
                    <span>{p.nombre}</span>
                    <small>{p.total_tareas} tareas</small>
                  </div>
                  <div className="proyecto-acciones">
                    <button onClick={() => setEditProyecto({ ...p })} title="Editar">✎</button>
                    <button className="borrar" onClick={() => eliminarProyecto(p.id)} title="Eliminar">✕</button>
                  </div>
                </li>
              ))}
              {!proyectos.length && <li className="vacio">Sin proyectos aun</li>}
            </ul>
          </section>

          <section className="bloque">
            <h2>Nuevo proyecto</h2>
            <input placeholder="Nombre del proyecto" value={nuevoProyecto.nombre}
              onChange={e => setNuevoProyecto({ ...nuevoProyecto, nombre: e.target.value })} />
            <textarea placeholder="Descripcion" value={nuevoProyecto.descripcion}
              onChange={e => setNuevoProyecto({ ...nuevoProyecto, descripcion: e.target.value })} />
            <button onClick={crearProyecto}>Crear proyecto</button>
          </section>

          <section className="bloque">
            <h2>Nueva tarea</h2>
            <input placeholder="Titulo de la tarea" value={nuevaTarea.titulo}
              onChange={e => setNuevaTarea({ ...nuevaTarea, titulo: e.target.value })} />
            <textarea placeholder="Descripcion" value={nuevaTarea.descripcion}
              onChange={e => setNuevaTarea({ ...nuevaTarea, descripcion: e.target.value })} />
            <select value={nuevaTarea.prioridad}
              onChange={e => setNuevaTarea({ ...nuevaTarea, prioridad: e.target.value })}>
              <option value="baja">Prioridad baja</option>
              <option value="media">Prioridad media</option>
              <option value="alta">Prioridad alta</option>
            </select>
            <select value={nuevaTarea.responsable_id}
              onChange={e => setNuevaTarea({ ...nuevaTarea, responsable_id: e.target.value })}>
              <option value="">Sin responsable</option>
              {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
            <label className="campo-fecha">Fecha limite
              <input type="date" value={nuevaTarea.fecha_limite}
                onChange={e => setNuevaTarea({ ...nuevaTarea, fecha_limite: e.target.value })} />
            </label>
            <button onClick={crearTarea} disabled={!proyectoSel}>Agregar tarea</button>
          </section>
        </aside>

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
                        {t.fecha_limite && <span className="fecha">{t.fecha_limite}</span>}
                      </div>
                      <div className="tarjeta-acciones">
                        <button onClick={() => moverTarea(t, -1)} title="Mover atras">←</button>
                        <button onClick={() => moverTarea(t, 1)} title="Mover adelante">→</button>
                        <button onClick={() => abrirEdicionTarea(t)} title="Editar">✎</button>
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

      {/* Modal: editar proyecto */}
      {editProyecto && (
        <div className="modal-fondo" onClick={() => setEditProyecto(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Editar proyecto</h3>
            <label>Nombre
              <input value={editProyecto.nombre}
                onChange={e => setEditProyecto({ ...editProyecto, nombre: e.target.value })} />
            </label>
            <label>Descripcion
              <textarea value={editProyecto.descripcion || ""}
                onChange={e => setEditProyecto({ ...editProyecto, descripcion: e.target.value })} />
            </label>
            <label>Estado
              <select value={editProyecto.estado}
                onChange={e => setEditProyecto({ ...editProyecto, estado: e.target.value })}>
                <option value="activo">Activo</option>
                <option value="pausado">Pausado</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </label>
            <div className="modal-acciones">
              <button className="secundario" onClick={() => setEditProyecto(null)}>Cancelar</button>
              <button onClick={guardarProyecto}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: editar tarea + historial */}
      {editTarea && (
        <div className="modal-fondo" onClick={() => setEditTarea(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Editar tarea</h3>
            <label>Titulo
              <input value={editTarea.titulo}
                onChange={e => setEditTarea({ ...editTarea, titulo: e.target.value })} />
            </label>
            <label>Descripcion
              <textarea value={editTarea.descripcion || ""}
                onChange={e => setEditTarea({ ...editTarea, descripcion: e.target.value })} />
            </label>
            <label>Estado
              <select value={editTarea.estado}
                onChange={e => setEditTarea({ ...editTarea, estado: e.target.value })}>
                {COLUMNAS.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
              </select>
            </label>
            <label>Prioridad
              <select value={editTarea.prioridad}
                onChange={e => setEditTarea({ ...editTarea, prioridad: e.target.value })}>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </label>
            <label>Responsable
              <select value={editTarea.responsable_id}
                onChange={e => setEditTarea({ ...editTarea, responsable_id: e.target.value })}>
                <option value="">Sin responsable</option>
                {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
              </select>
            </label>
            <label>Fecha limite
              <input type="date" value={editTarea.fecha_limite || ""}
                onChange={e => setEditTarea({ ...editTarea, fecha_limite: e.target.value })} />
            </label>

            <div className="historial">
              <h4>Historial de cambios</h4>
              {historial.length === 0 && <p className="vacio">Sin movimientos registrados.</p>}
              <ul>
                {historial.map((h, i) => (
                  <li key={i}>
                    <strong>{h.accion}</strong>
                    {h.estado_anterior && h.estado_nuevo && <> · {h.estado_anterior} → {h.estado_nuevo}</>}
                    <br /><small>{new Date(h.fecha).toLocaleString()}</small>
                  </li>
                ))}
              </ul>
            </div>

            <div className="modal-acciones">
              <button className="secundario" onClick={() => setEditTarea(null)}>Cancelar</button>
              <button onClick={guardarTarea}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
