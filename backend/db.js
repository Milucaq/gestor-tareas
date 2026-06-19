// =====================================================================
// db.js - Conexiones a MySQL (datos transaccionales) y MongoDB (historial)
// =====================================================================
import mysql from "mysql2/promise";
import { MongoClient } from "mongodb";

// --- Pool de conexiones MySQL -----------------------------------------
export const mysqlPool = mysql.createPool({
    host:     process.env.MYSQL_HOST     || "localhost",
    port:     process.env.MYSQL_PORT     || 3306,
    user:     process.env.MYSQL_USER     || "root",
    password: process.env.MYSQL_PASSWORD || "rootpass",
    database: process.env.MYSQL_DATABASE || "gestor_tareas",
    waitForConnections: true,
    connectionLimit: 10
});

// --- Conexion MongoDB -------------------------------------------------
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";
const mongoClient = new MongoClient(mongoUri);
let mongoDb = null;

export async function getMongoDb() {
    if (!mongoDb) {
        await mongoClient.connect();
        mongoDb = mongoClient.db("gestor_tareas");
        // Asegura el indice del historial al iniciar
        await mongoDb.collection("historial_actividades")
                     .createIndex({ tarea_id: 1, fecha: -1 });
    }
    return mongoDb;
}

// Helper: registrar un evento en el historial (MongoDB)
export async function registrarHistorial(evento) {
    const db = await getMongoDb();
    await db.collection("historial_actividades").insertOne({
        ...evento,
        fecha: new Date()
    });
}
