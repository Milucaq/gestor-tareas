// =====================================================================
// MongoDB - Coleccion "historial_actividades"
// Almacena el registro de cambios (logs) de las tareas del sistema.
// Practica Calificada 2 - Tecnologias Emergentes
//
// Ejecutar con:  mongosh < mongo_operations.js
//   o pegar las sentencias en mongosh / MongoDB Atlas (Shell)
// =====================================================================

// Seleccionar (o crear) la base de datos
use("gestor_tareas");

// ---------------------------------------------------------------------
// Diseno de documento de la coleccion historial_actividades
// ---------------------------------------------------------------------
// {
//   tarea_id:        Number,   // id de la tarea en MySQL
//   proyecto_id:     Number,   // id del proyecto en MySQL
//   usuario_id:      Number,   // quien realizo el cambio
//   accion:          String,   // "creacion" | "cambio_estado" | "edicion" | "eliminacion"
//   estado_anterior: String,   // estado previo (si aplica)
//   estado_nuevo:    String,   // estado resultante (si aplica)
//   descripcion:     String,   // detalle legible del cambio
//   fecha:           Date      // marca de tiempo del evento
// }
//
// Nota: NoSQL es ideal aqui porque el historial es un flujo de eventos
// heterogeneos, de alto volumen y solo de lectura/append; no necesita
// las restricciones rigidas de un esquema relacional.

// ---------------------------------------------------------------------
// insertOne()  -> registrar un evento
// ---------------------------------------------------------------------
db.historial_actividades.insertOne({
    tarea_id: 3,
    proyecto_id: 1,
    usuario_id: 2,
    accion: "cambio_estado",
    estado_anterior: "en_proceso",
    estado_nuevo: "en_revision",
    descripcion: "La tarea 'Crear API de proyectos' paso a revision",
    fecha: new Date()
});

// insertMany para cargar varios eventos de ejemplo
db.historial_actividades.insertMany([
    {
        tarea_id: 1, proyecto_id: 1, usuario_id: 2,
        accion: "creacion", estado_anterior: null, estado_nuevo: "pendiente",
        descripcion: "Se creo la tarea 'Disenar modelo de base de datos'",
        fecha: new Date("2026-06-05T09:00:00Z")
    },
    {
        tarea_id: 1, proyecto_id: 1, usuario_id: 2,
        accion: "cambio_estado", estado_anterior: "en_proceso", estado_nuevo: "finalizado",
        descripcion: "Modelo de base de datos completado",
        fecha: new Date("2026-06-10T17:30:00Z")
    },
    {
        tarea_id: 4, proyecto_id: 1, usuario_id: 3,
        accion: "cambio_estado", estado_anterior: "pendiente", estado_nuevo: "en_proceso",
        descripcion: "Se inicio el desarrollo de la API de tareas",
        fecha: new Date("2026-06-15T11:15:00Z")
    }
]);

// ---------------------------------------------------------------------
// find()  -> consultar eventos
// ---------------------------------------------------------------------
// Todo el historial
db.historial_actividades.find();

// Historial de una tarea especifica, ordenado por fecha
db.historial_actividades.find({ tarea_id: 1 }).sort({ fecha: 1 });

// Solo los cambios de estado del proyecto 1
db.historial_actividades.find({ proyecto_id: 1, accion: "cambio_estado" });

// ---------------------------------------------------------------------
// updateOne()  -> corregir / enriquecer un registro
// ---------------------------------------------------------------------
db.historial_actividades.updateOne(
    { tarea_id: 3, accion: "cambio_estado" },
    { $set: { descripcion: "Revision solicitada por el Scrum Master" } }
);

// ---------------------------------------------------------------------
// deleteOne()  -> eliminar un registro
// ---------------------------------------------------------------------
db.historial_actividades.deleteOne({ tarea_id: 4, accion: "cambio_estado" });

// ---------------------------------------------------------------------
// INDICE (requisito: al menos un indice en MongoDB)
// Indice compuesto por tarea_id + fecha: acelera la consulta del
// historial cronologico de cada tarea (operacion mas frecuente).
// ---------------------------------------------------------------------
db.historial_actividades.createIndex({ tarea_id: 1, fecha: -1 });

// Verificar los indices creados
db.historial_actividades.getIndexes();
