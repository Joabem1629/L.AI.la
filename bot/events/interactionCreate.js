const { runCommand } = require("../commands/templates/commandTemplate");

module.exports = (client) => {
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;

        await runCommand(interaction, "slash");
    });
};
