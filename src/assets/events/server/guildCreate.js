const { EmbedBuilder } = require("discord.js");
module.exports = async (bot, guild) => {
    try {

        const prefix = bot.discord.primaryPrefix
        const secprefix = bot.discord.secondaryPrefix
        const guildId = guild.id
        console.log(`The Guild ID: ${guild.id} has been writen to the db.`);
        const guildOwner = await bot.guilds.fetch(guildId)
        const owner = await guildOwner.fetchOwner()

        let INVITES_CHANNEL = bot.channels.cache.get(bot.discord.botInvitesChannel)
        if (!INVITES_CHANNEL) return;
        const embed1 = new EmbedBuilder()
            .setTitle(`Bot has been invited to a new server!`)
            .setDescription(`
        **Name : ** ${guild.name}
        **ID : ** ${guild.id}
        **Owner : ** ${owner.user.username}
        **Members : ** ${guild.memberCount}
        `)
            .setColor(bot.colors.embedColor)
            .setTimestamp()
        INVITES_CHANNEL.send({ embeds: [embed1] });

        if (guildId === bot.discord.OwnerID) return;
        if (owner) {
            const embed = new EmbedBuilder()
                .setTitle(`Hey ${owner.user.username}, I'am ${bot.discord.botusername} !`)
                .setDescription(`The default prefix for my commands is \`${prefix}\` or \`${secprefix}\` but you can change it at any time.\n\nDon't know where to start? Use \`/help\` to see a list of available commands.\n\nJoin our support server [here](${bot.discord.supportServer}) to chat with other people and get help. Good luck!`)
                .setColor(bot.colors.embedColor)
                .setTimestamp()
                .setThumbnail(bot.discord.botProfilePicture)
                .setFooter({ text: `${bot.discord.botusername}`, iconURL: bot.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) })
            owner.send({ embeds: [embed] }).catch(() => console.log('Failed to dm guild owner'))
        } else {
            return console.log("Couldn't dm the owner")
        }

    } catch (err) {
        console.log(err.message)
    }
}