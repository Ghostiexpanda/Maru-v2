const fs = require('fs')
const path = require('path')

function logCommand(bot, message, commandName) {

    const filePath = path.join(__dirname, '../../../../lib/prefix.log')
    let timestamp

    const playerName = message.author.username;
    const serverName = message.guild.name;
    const playerId = message.author.id

    timestamp = new Date().toISOString()
    const logMessage = `[${playerId}]${playerName} used the command (${commandName}) in [${serverName}] at: (${timestamp})\n`;

    fs.appendFile(filePath, logMessage, (err) => {
        if (err) {
            console.error(`Failed to log message: ${err}`);
        }
    });

    timestamp = new Date().toLocaleString('en-GB', {
        timeZone: 'UTC',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const discordLogMessage = `\`\`\`css
[${playerId}]${playerName} used the command (${commandName}) in [${serverName}] at: (${timestamp})
\`\`\``;

    const channel = bot.channels.cache.get(bot.discord.prefixLoggingChannel)
    if (!channel) return console.log("Logging channel doesn't exist.")
    //await channel.send(discordLogMessage)
}

function logSlashCommand(bot, interaction, commandName) {

    const filePath = path.join(__dirname, '../../../../lib/slash.log')
    let timestamp

    const playerName = interaction.user.username;
    const serverName = interaction.guild.name;
    const playerId = interaction.user.id

    timestamp = new Date().toISOString()
    const logMessage = `[${playerId}]${playerName} /${commandName} in [${serverName}] at: (${timestamp})\n`;

    fs.appendFile(filePath, logMessage, (err) => {
        if (err) {
            console.error(`Failed to log message: ${err}`);
        }
    });

    timestamp = new Date().toLocaleString('en-GB', {
        timeZone: 'UTC',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const discordLogMessage = `\`\`\`css
[${playerId}]${playerName} used /${commandName} in [${serverName}] at: (${timestamp})
\`\`\``;

    const channel = bot.channels.cache.get(bot.discord.slashLoggingChannel)
    if (!channel) return console.log("Logging channel doesn't exist.")
    //await channel.send(discordLogMessage)
}



module.exports = { logCommand, logSlashCommand }