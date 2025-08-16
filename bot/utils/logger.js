const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

const logDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const botLogPath = path.join(logDir, "bot.log");
const errorLogPath = path.join(logDir, "errors.log");
const answersLogPath = path.join(logDir, "answers.log");

let discordClient = null;

function setDiscordClient(client) {
    discordClient = client;
}

function writeLog(file, message) {
    fs.appendFileSync(file, `[${new Date().toISOString()}] ${message}\n`);
}

// Enviar embed a canal de logs si client está definido
async function sendToChannel(embed) {
    if (!discordClient) return;
    try {
        const guild = await discordClient.guilds.fetch(process.env.GUILD_ID);
        const channel = await guild.channels.fetch(process.env.LOG_CHANNEL_ID);
        if (channel.isTextBased()) {
            await channel.send({ embeds: [embed] });
        }
    } catch (err) {
        console.error("❌ Error enviando log a canal de Discord:", err);
    }
}

module.exports = {
    setDiscordClient,
    info: async (msg, details = {}) => {
        console.log(`ℹ️ ${msg}`);
        writeLog(botLogPath, `INFO: ${msg} ${JSON.stringify(details)}`);
        
        const embed = new EmbedBuilder()
            .setTitle("ℹ️ Info")
            .setDescription(msg)
            .setColor("Blue")
            .addFields(
                { name: "Detalles", value: "```json\n" + JSON.stringify(details, null, 2) + "\n```" }
            )
            .setTimestamp(new Date());
        await sendToChannel(embed);
    },
    error: async (msg, err = {}) => {
        console.error(`❌ ${msg}`, err);
        writeLog(botLogPath, `ERROR: ${msg} ${err.stack || err}`);
        writeLog(errorLogPath, `${msg} ${err.stack || err}`);

        const embed = new EmbedBuilder()
            .setTitle("❌ Error")
            .setDescription(msg)
            .setColor("Red")
            .addFields(
                { name: "Stack/Error", value: "```js\n" + (err.stack || err.toString()) + "\n```" }
            )
            .setTimestamp(new Date());
        await sendToChannel(embed);
    },
    answer: async (context) => {
        const { user, guild, command, args, response } = context;

        const logMsg = `
User: ${user?.tag || user?.username} (ID: ${user?.id})
Guild: ${guild?.name || "DM"} (ID: ${guild?.id || "N/A"})
Command: ${command}
Args: ${JSON.stringify(args)}
Response: ${response}
Time: ${new Date().toISOString()}
-------------------------------------`;

        writeLog(answersLogPath, logMsg);
        writeLog(botLogPath, `ANSWER LOGGED: ${command}`);

        const embed = new EmbedBuilder()
            .setTitle(`💬 Comando ejecutado: ${command}`)
            .setColor("Green")
            .addFields(
                { name: "Usuario", value: `${user?.tag || user?.username} (ID: ${user?.id})`, inline: true },
                { name: "Guild", value: `${guild?.name || "DM"} (ID: ${guild?.id || "N/A"})`, inline: true },
                { name: "Args", value: "```json\n" + JSON.stringify(args, null, 2) + "\n```" },
                { name: "Response", value: "```" + response + "```" }
            )
            .setTimestamp(new Date());

        await sendToChannel(embed);
    }
};
