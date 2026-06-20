// =====================================================================
// server.js - API REST del Sistema de Gestion de Tareas y Proyectos
// Operaciones CRUD para proyectos y tareas (MySQL) + historial (MongoDB)
// =====================================================================
import express from "express";
import cors from "cors";
import { mysqlPool, getMongoDb, registrarHistorial } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// READ - listar usuarios (para asignar responsables)
app.get("/api/usuarios", async (req, res) => {
    try {
        const [rows] = await mysqlPool.query(
            "SELECT id, nombre, rol FROM usuarios ORDER BY nombre"
        );
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// =====================================================================
// CRUD PROYECTOS
// =====================================================================

// READ - listar proyectos (con numero de tareas)
app.get("/api/proyectos", async (req, res) => {
    try {
        const [rows] = await mysqlPool.query(`
            SELECT p.*, COUNT(t.id) AS total_tareas
            FROM proyectos p
            LEFT JOIN tareas t ON t.proyecto_id = p.id
            GROUP BY p.id
            ORDER BY p.id DESC
        `);
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// CREATE - crear proyecto
app.post("/api/proyectos", async (req, res) => {
    try {
        const { nombre, descripcion, fecha_inicio, fecha_fin, responsable_id } = req.body;
        const [r] = await mysqlPool.query(
            `INSERT INTO proyectos (nombre, descripcion, fecha_inicio, fecha_fin, responsable_id)
             VALUES (?, ?, ?, ?, ?)`,
            [nombre, descripcion, fecha_inicio || null, fecha_fin || null, responsable_id || null]
        );
        res.status(201).json({ id: r.insertId, mensaje: "Proyecto creado" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// UPDATE - actualizar proyecto
app.put("/api/proyectos/:id", async (req, res) => {
    try {
        const { nombre, descripcion, estado, fecha_inicio, fecha_fin, responsable_id } = req.body;
        await mysqlPool.query(
            `UPDATE proyectos
             SET nombre=?, descripcion=?, estado=?, fecha_inicio=?, fecha_fin=?, responsable_id=?
             WHERE id=?`,
            [nombre, descripcion, estado, fecha_inicio || null, fecha_fin || null,
             responsable_id || null, req.params.id]
        );
        res.json({ mensaje: "Proyecto actualizado" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE - eliminar proyecto
app.delete("/api/proyectos/:id", async (req, res) => {
    try {
        await mysqlPool.query("DELETE FROM proyectos WHERE id=?", [req.params.id]);
        res.json({ mensaje: "Proyecto eliminado" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// =====================================================================
// CRUD TAREAS
// =====================================================================

// READ - listar tareas (opcionalmente por proyecto), con join a proyecto/usuario
app.get("/api/tareas", async (req, res) => {
    try {
        const { proyecto_id } = req.query;
        const where = proyecto_id ? "WHERE t.proyecto_id = ?" : "";
        const params = proyecto_id ? [proyecto_id] : [];
        const [rows] = await mysqlPool.query(`
            SELECT t.*, p.nombre AS proyecto, u.nombre AS responsable
            FROM tareas t
            JOIN proyectos p ON t.proyecto_id = p.id
            LEFT JOIN usuarios u ON t.responsable_id = u.id
            ${where}
            ORDER BY t.fecha_creacion DESC
        `, params);
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// CREATE - crear tarea (+ registra evento en MongoDB)
app.post("/api/tareas", async (req, res) => {
    try {
        const { titulo, descripcion, prioridad, proyecto_id, responsable_id, fecha_limite } = req.body;
        const [r] = await mysqlPool.query(
            `INSERT INTO tareas (titulo, descripcion, prioridad, proyecto_id, responsable_id, fecha_limite)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [titulo, descripcion, prioridad || "media", proyecto_id,
             responsable_id || null, fecha_limite || null]
        );
        await registrarHistorial({
            tarea_id: r.insertId, proyecto_id, usuario_id: responsable_id || null,
            accion: "creacion", estado_anterior: null, estado_nuevo: "pendiente",
            descripcion: `Se creo la tarea '${titulo}'`
        });
        res.status(201).json({ id: r.insertId, mensaje: "Tarea creada" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// UPDATE - actualizar tarea / mover en Kanban (+ registra cambio de estado)
app.put("/api/tareas/:id", async (req, res) => {
    try {
        const { titulo, descripcion, estado, prioridad, responsable_id, fecha_limite } = req.body;

        // Leer estado anterior para el historial
        const [[prev]] = await mysqlPool.query(
            "SELECT estado, proyecto_id FROM tareas WHERE id=?", [req.params.id]
        );

        await mysqlPool.query(
            `UPDATE tareas
             SET titulo=?, descripcion=?, estado=?, prioridad=?, responsable_id=?, fecha_limite=?
             WHERE id=?`,
            [titulo, descripcion, estado, prioridad, responsable_id || null,
             fecha_limite || null, req.params.id]
        );

        if (prev && prev.estado !== estado) {
            await registrarHistorial({
                tarea_id: Number(req.params.id), proyecto_id: prev.proyecto_id,
                usuario_id: responsable_id || null, accion: "cambio_estado",
                estado_anterior: prev.estado, estado_nuevo: estado,
                descripcion: `La tarea cambio de '${prev.estado}' a '${estado}'`
            });
        }
        res.json({ mensaje: "Tarea actualizada" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE - eliminar tarea
app.delete("/api/tareas/:id", async (req, res) => {
    try {
        await mysqlPool.query("DELETE FROM tareas WHERE id=?", [req.params.id]);
        res.json({ mensaje: "Tarea eliminada" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// =====================================================================
// HISTORIAL (MongoDB)
// =====================================================================
app.get("/api/historial/:tarea_id", async (req, res) => {
    try {
        const db = await getMongoDb();
        const docs = await db.collection("historial_actividades")
            .find({ tarea_id: Number(req.params.tarea_id) })
            .sort({ fecha: -1 }).toArray();
        res.json(docs);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// =====================================================================
// MIDDLEWARE DE MANEJO DE ERRORES GLOBAL
// =====================================================================
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        error: err.message
    });
});

// =====================================================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
