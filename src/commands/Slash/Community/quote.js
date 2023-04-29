const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const quotes = require('../../../quotes.json');

module.exports = {
    config: {
        name: "quote",
        category: "Community",
        description: `Get a random quote`,
        usage: "quote",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Gives you a random famous quote.'),
    async execute(interaction) {

        const randomizer = Math.floor(Math.random() * quotes.length);

        const embed = new EmbedBuilder()
        .setColor('DarkBlue')
        .setAuthor({ name: `🤔 Quote Carpet`})
        .setFooter({ text: `🤔 Quote Fetched`})
        .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
        .setTimestamp()
        .addFields({ name: `• Quote`, value: `> ${quotes[randomizer].text}`})
        .addFields({ name: `• Author`, value: `> ${quotes[randomizer].from}`})

        await interaction.reply({ embeds: [embed] });
    }
}