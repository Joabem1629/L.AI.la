const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config({ path: "../.env" });

const messageCreate = require("./events/messageCreate");
const interactionCreate = require("./events/interactionCreate");
const { registerGuildSlashCommands } = require("./commands/templates/commandTemplate");
const logger = require("./utils/logger");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Pasar client al logger
logger.setDiscordClient(client);

// Inicializar eventos
messageCreate(client);
interactionCreate(client);

client.once("ready", async () => {
    console.log("🤖 Bot conectado a Discord");

    try {
        await registerGuildSlashCommands(client);
        await logger.info("Bot listo y comandos slash registrados", {
            botTag: client.user.tag,
            botId: client.user.id,
            guilds: client.guilds.cache.map(g => ({ name: g.name, id: g.id }))
        });
    } catch (err) {
        await logger.error("Error inicializando el bot", err);
    }
});

client.login(process.env.DISCORD_TOKEN);
