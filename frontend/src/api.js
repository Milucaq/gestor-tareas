// Cliente API: encapsula las llamadas al backend (operaciones CRUD)
const BASE = "/api";

async function req(url, options = {}) {
  const res = await fetch(BASE + url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!res.ok) throw new Error("Error en la peticion: " + res.status);
  return res.json();
}

export const api = {
  // Proyectos
  listarProyectos: () => req("/proyectos"),
  crearProyecto:   (data) => req("/proyectos", { method: "POST", body: JSON.stringify(data) }),
  editarProyecto:  (id, data) => req(`/proyectos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  borrarProyecto:  (id) => req(`/proyectos/${id}`, { method: "DELETE" }),

  // Tareas
  listarTareas:    (proyectoId) => req(`/tareas${proyectoId ? `?proyecto_id=${proyectoId}` : ""}`),
  crearTarea:      (data) => req("/tareas", { method: "POST", body: JSON.stringify(data) }),
  editarTarea:     (id, data) => req(`/tareas/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  borrarTarea:     (id) => req(`/tareas/${id}`, { method: "DELETE" })
};
