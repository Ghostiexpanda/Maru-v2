const { EmbedBuilder } = require("discord.js");

module.exports = async (bot, guild) => {
    try {

        const guildId = guild.id

        console.log(`The Guild ID: ${guildId} has been removed from the db.`);

        let DELETE_CHANNEL = bot.channels.cache.get(bpt.discord.botRemovedChannel)
        if (!DELETE_CHANNEL) return;
        const guildOwner = await bot.guilds.fetch(guildId)
        const owner = await guildOwner.fetchOwner()

        const DELETE_EMBED = new EmbedBuilder()
            .setTitle(`Bot has been removed from a server!`)
            .setDescription(`**Name : ** ${guild.name}\n**ID : ** ${guild.id}\n**Owner : ** ${owner.user.username}\n**Members : ** ${guild.memberCount}`)
            .setColor(bot.colors.red)
            .setTimestamp()
        DELETE_CHANNEL.send({ embeds: [DELETE_EMBED] })

    } catch (e) {
        console.log(e.message)
    }
}