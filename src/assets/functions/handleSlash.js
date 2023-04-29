const { Routes } = require("discord.js");
const { REST } = require("discord.js");
const { readdirSync } = require("fs")
const token = global.config.token;
const botId = global.config.botId;

module.exports = (bot) => {
    console.log("[i] Slash Command Handler:".blue);
    bot.handleSlahCommands = async () => {
        bot.commandArray = [];

        const commandFolders = readdirSync("./src/commands/Slash");

        for (var folder of commandFolders) {
            const commandFiles = readdirSync(`./src/commands/Slash/${folder}`);
            for (const file of commandFiles) {
                const command = require(`../../commands/Slash/${folder}/${file}`);
                bot.slash_commands.set(command.data.name, command);
                bot.commandArray.push(command.data.toJSON());
                console.log(`Loading Slash command ${file}`.green)
            }
        }

        const rest = new REST({ version: "10" }).setToken(token);

        (async () => {
            try {
                console.log("Started refreshing application (/) commands.".yellow);
                await rest.put(Routes.applicationCommands(botId), {
                    body: bot.commandArray,
                });
                console.log("Successfully reloaded application (/) commands.".green);
            } catch (error) {
                console.error(error);
            }
        })();
    }
}

/* 
                if (command.data.name !== 'example') {
                    bot.slash_commands.set(command.data.name, command);
                    bot.commandArray.push(command.data.toJSON());
                    console.log(`Loading Slash command ${file}`.green)
                } else {
                    console.log(`Skipping Slash command ${file}`.yellow)
                } */

