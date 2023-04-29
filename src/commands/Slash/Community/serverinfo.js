const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    config: {
        name: "serverinfo",
        category: "Community",
        description: `Shows info about the server`,
        usage: "serverinfo",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName(`serverinfo`)
        .setDescription('Shows info about the server'),

    async execute(interaction) {

        const { guild } = interaction;
        const { members } = guild;
        const { name, ownerId, createdTimestamp, memberCount } = guild;
        const icon = guild.iconURL() || 'https://cdn.discordapp.com/attachments/1085363855082934276/1092018627995238440/unknown.png';
        const emojis = guild.emojis.cache.size;
        const roles = guild.roles.cache.size;
        const id = guild.id;

        let baseVerification = guild.verificationLevel;

        if (typeof baseVerification === 'number') {
            if (baseVerification == 0) baseVerification = 'None';
            if (baseVerification == 1) baseVerification = 'Low';
            if (baseVerification == 2) baseVerification = 'Medium';
            if (baseVerification == 3) baseVerification = 'High';
            if (baseVerification == 4) baseVerification = 'Very High';
        } else {
            baseVerification = 'Unknown';
        }

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setThumbnail(icon)
        .setAuthor({ name: name, iconURL: icon })
        .setFooter({ text: `Server ID: ${id}` })
        .setTimestamp()
        .addFields({ name: "Name", value: `${name}`, inline: false })
        .addFields({ name: "Date Created", value: `<t:${parseInt(createdTimestamp / 1000)}:R> (hover for complete date)`, inline: true })
        .addFields({ name: "Server Owner", value: `<@${ownerId}>`, inline: true })
        .addFields({ name: "Server Members", value: `${memberCount}`, inline: true })
        .addFields({ name: "Emoji Number", value: `${emojis}`, inline: true })
        .addFields({ name: "Role Number", value: `${roles}`, inline: true })
        .addFields({ name: "Verification Level", value: `${baseVerification}`, inline: true })
        .addFields({ name: "Server Boosts", value: `${guild.premiumSubscriptionCount}`, inline: true })

        await interaction.reply({ embeds: [embed] })

    }
}
