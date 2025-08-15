require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
console.log("FASTAPI_URL cargada:", process.env.FASTAPI_URL);

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();

// DB
const dbPath = path.join(__dirname, 'database', 'laila.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error(err);
    else console.log('Conectado a la DB');
});

// Evento messageCreate
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Comando de prueba con prefijo
    if (message.content.startsWith(process.env.PREFIX + 'hola')) {
        message.reply(`¡Hola ${message.author.username}! 😎`);
        return;
    }

    // Enviar a LLM (FastAPI) si se menciona bot
    if (message.mentions.has(client.user)) {
        try {
            const res = await axios.post(process.env.FASTAPI_URL, { mensaje: message.content });
            message.reply(res.data.respuesta);
        } catch (err) {
            console.error(err);
            message.reply('Error al generar respuesta');
        }
    }
});

client.once('ready', () => {
    console.log(`Conectado como ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
