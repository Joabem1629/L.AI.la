const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const { sendMessageToAPI } = require("../../apiConnector");
const logger = require("../../utils/logger");

// Rutas
const commandsPath = path.resolve(__dirname, "../commands.json");
const logsDir = path.resolve(__dirname, "../../logs");
const answersLogPath = path.join(logsDir, "answers.log");
const errorsLogPath = path.join(logsDir, "errors.log");

// Crear carpeta de logs si no existe
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// Cargar comandos
function loadCommands() {
    if (!fs.existsSync(commandsPath)) return {};
    return JSON.parse(fs.readFileSync(commandsPath, "utf8"));
}

// Ejecuta un comando
async function executeCommand(command, context, args = []) {
    if (!command) return;

    try {
        const user = context.author || context.user;
        const guild = context.guild;
        const isAdmin = command.permissions.admin && process.env.ADMIN_ID === user.id;
        const isModerator = command.permissions.moderator;
        const isUser = command.permissions.user;

        if (!(isAdmin || isModerator || isUser)) {
            const msg = "❌ No tienes permisos para usar este comando.";
            if (context.reply) await context.reply(msg);
            else if (context.channel) await context.channel.send(msg);
            return;
        }

        if (command.requires_input && (!args || args.length === 0)) {
            const msg = "⚠️ Este comando requiere parámetros.";
            if (context.reply) await context.reply(msg);
            else if (context.channel) await context.channel.send(msg);
            return;
        }

        let response = command.auto_response || "";

        // Ping con latencia real en un solo mensaje
        if (command.name === "ping") {
            const start = Date.now();
            const latencyWS = context.client.ws.ping;
            response = `🏓 Pong! Latencia de mensaje: ${Date.now() - start}ms | Latencia WS: ${latencyWS}ms`;
        }

        // Preparar mensaje embed
        if (command.embed) {
            const embed = new EmbedBuilder()
                .setTitle(command.name || "Comando")
                .setDescription(response)
                .setColor("Random");

            if (context.reply) await context.reply({ embeds: [embed] });
            else if (context.channel) await context.channel.send({ embeds: [embed] });
        } else {
            if (context.reply) await context.reply(response);
            else if (context.channel) await context.channel.send(response);
        }

        // Log de respuesta en archivo y Discord
        await logger.answer({
            user,
            guild,
            command: command.name,
            args,
            response
        });

        // Enviar a FastAPI
        await sendMessageToAPI(context, command?.name, args);

    } catch (err) {
        console.error("❌ Error ejecutando comando:", err);
        await logger.error("Error ejecutando comando", err);
    }
}

// Detecta y ejecuta comando según tipo
async function runCommand(context, type) {
    const commands = loadCommands();
    let commandName, args = [];

    if (type === "prefix" || type === "context") {
        let content = context.content.toLowerCase();
        const prefix = process.env.PREFIX || "!";

        if (type === "prefix") {
            if (!content.startsWith(prefix)) return;
            content = content.slice(prefix.length).trim();
        } else {
            const bot = context.client.user;
            const mentionRegex = new RegExp(`^<@!?${bot.id}>|\\blaila\\b|l\\.ai\\.la`, "i");
            if (!mentionRegex.test(content)) return;
            content = content.replace(mentionRegex, "").trim();
        }

        const split = content.split(/ +/);
        commandName = split.shift();
        args = split;

    } else if (type === "slash") {
        commandName = context.commandName;
        args = context.options?.data?.map(opt => opt.value) || [];
    }

    const command = commands[commandName?.toLowerCase()];
    if (!command || !command.type.includes(type)) return;

    await executeCommand(command, context, args);
}

// Registrar slash commands en guild
async function registerGuildSlashCommands(client) {
    const guildId = process.env.GUILD_ID;
    if (!guildId) return console.log("⚠️ GUILD_ID no definido en .env");

    const guild = await client.guilds.fetch(guildId);
    const commands = loadCommands();

    const slashCommands = [];
    for (const key in commands) {
        const cmd = commands[key];
        if (cmd.type.includes("slash")) {
            slashCommands.push({
                name: key,
                description: cmd.description || key,
                options: cmd.requires_input ? [{ name: "input", type: 3, description: "Parámetro", required: true }] : []
            });
        }
    }

    // Limpiar y registrar
    await guild.commands.set([]);
    console.log("🧹 Comandos slash previos eliminados");
    await guild.commands.set(slashCommands);
    console.log(`✅ Registrados ${slashCommands.length} slash commands en guild ${guild.name}`);
}

module.exports = { executeCommand, runCommand, registerGuildSlashCommands };
