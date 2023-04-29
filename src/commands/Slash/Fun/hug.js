const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    config: {
        name: "hug",
        category: "Fun",
        description: `Hug someone`,
        usage: "hug <user>",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName("hug")
        .setDescription("Send a hug gif to a user.")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to send the hug to.")
                .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const hugGifs = [
            "https://i.imgur.com/r9aU2xv.gif",
            "https://i.imgur.com/BPLqSJC.gif",
            "https://i.imgur.com/ntqYLGl.gif",
            "https://i.imgur.com/4oLIrwj.gif",
            "https://i.imgur.com/TQZ7YJO.gif",
            "https://i.imgur.com/8odqc1d.gif"
        ];
        const selectedGif = hugGifs[Math.floor(Math.random() * hugGifs.length)];
        const hugEmbed = new EmbedBuilder()
            .setColor("#FF69B4")
            .setDescription(`${interaction.user} has hugged ${user}!`)
            .setImage(selectedGif);

        await interaction.reply({ embeds: [hugEmbed] });
    },
};
