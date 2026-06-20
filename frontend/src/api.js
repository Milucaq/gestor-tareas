const BASE = `${import.meta.env.VITE_API_URL}/api`;

async function req(url, options = {}) {
  const res = await fetch(BASE + url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("API Error:", data);
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return data;
}

export const api = {
  listarProyectos: () => req("/proyectos"),
  crearProyecto: (data) =>
    req("/proyectos", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  editarProyecto: (id, data) =>
    req(`/proyectos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  borrarProyecto: (id) =>
    req(`/proyectos/${id}`, {
      method: "DELETE",
    }),
  
  // Usuarios
  listarUsuarios: () => req("/usuarios"),

  listarTareas: (proyectoId) =>
    req(`/tareas${proyectoId ? `?proyecto_id=${proyectoId}` : ""}`),

  crearTarea: (data) =>
    req("/tareas", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  editarTarea: (id, data) =>
    req(`/tareas/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  borrarTarea: (id) =>
    req(`/tareas/${id}`, {
      method: "DELETE",
    }),
};
