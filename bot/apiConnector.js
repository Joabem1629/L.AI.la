const axios = require("axios");
const { error: logError } = require("./utils/logger");

const API_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000/message/";

/**
 * Normaliza cualquier dato para que FastAPI lo acepte
 */
function normalizeMessageData(messageData) {
    return {
        user_id: messageData.user_id ? String(messageData.user_id) : "unknown",
        username: messageData.username || "unknown",
        guild_id: messageData.guild_id ? String(messageData.guild_id) : null,
        guild_name: messageData.guild_name || null,
        message: messageData.message ? String(messageData.message) : messageData.command ? String(messageData.command) : "",
        command: messageData.command ? String(messageData.command) : null,
        args: Array.isArray(messageData.args) ? messageData.args.map(String) : [],
    };
}

/**
 * Envía mensaje a la API de forma asíncrona
 */
function sendMessageToAPI(messageData) {
    const payload = normalizeMessageData(messageData);

    axios.post(API_URL, payload)
        .then(() => {
            // Opcional: console.log("[API] Mensaje enviado correctamente");
        })
        .catch(err => {
            console.error("❌ Error enviando mensaje a API:", err.message);
            const truncated = (err.message || "Error desconocido").slice(0, 1024);
            logError(`❌ Error enviando mensaje a API: ${truncated}`);
        });
}

module.exports = { sendMessageToAPI };
