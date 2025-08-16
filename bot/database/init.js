const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "laila.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("❌ Error abriendo DB:", err.message);
    else console.log("✅ Base de datos inicializada");
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS mensajes (
        id TEXT PRIMARY KEY,
        usuario TEXT,
        mensaje TEXT,
        fecha_hora DATETIME
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS interacciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trigger TEXT,
        respuesta TEXT,
        tipo TEXT DEFAULT 'evento',
        usuario_prioritario TEXT DEFAULT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS usuarios_prioritarios (
        usuario_id TEXT PRIMARY KEY,
        nombre_apodo TEXT,
        prioridad INT DEFAULT 1,
        ultima_actualizacion DATETIME
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS canal_reglas (
        canal_id TEXT PRIMARY KEY,
        permitido BOOLEAN DEFAULT 1,
        ultima_actualizacion DATETIME
    )`);
});

module.exports = db;
