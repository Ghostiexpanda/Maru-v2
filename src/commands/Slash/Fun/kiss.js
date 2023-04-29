const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    config: {
        name: "kiss",
        category: "Fun",
        description: "Kiss a specal someone",
        usage: "kiss <user>",
        type: "slash", // or "slash"
        cooldown: 1
    },
    data: new SlashCommandBuilder()
        .setName("kiss")
        .setDescription("Send a kiss gif to a user.")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to send the kiss to.")
                .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const kissGifs = [
            "https://i.imgur.com/i1PIph3.gif",
            "https://i.imgur.com/WVSwvm6.gif",
            "https://i.imgur.com/sZhtvBR.gif",
            "https://i.imgur.com/q340AoA.gif",
            "https://i.imgur.com/o9MMMeW.gif",
            "https://i.imgur.com/OjTBV8G.gif"
        ];
        const selectedGif = kissGifs[Math.floor(Math.random() * kissGifs.length)];
        const kissEmbed = new EmbedBuilder()
            .setColor("#FF69B4")
            .setDescription(`${interaction.user} has sent a kiss to ${user}!`)
            .setImage(selectedGif);

        await interaction.reply({ embeds: [kissEmbed] });
    },
};
