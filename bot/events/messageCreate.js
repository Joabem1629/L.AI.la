const db = require("../database/init");
const { runCommand } = require("../commands/templates/commandTemplate");

module.exports = (client) => {
    client.on("messageCreate", async (message) => {
        if (message.author.bot) return;

        // Guardar mensaje en DB
        db.run(
            `INSERT INTO mensajes (id, usuario, mensaje, fecha_hora) VALUES (?, ?, ?, datetime('now'))`,
            [message.id, message.author.username, message.content],
            (err) => {
                if (err) console.error("❌ Error guardando mensaje:", err.message);
            }
        );

        // Ejecutar comandos prefix y context
        await runCommand(message, "prefix");
        await runCommand(message, "context");
    });
};
