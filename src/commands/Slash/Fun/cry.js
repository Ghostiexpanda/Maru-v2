const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    config: {
        name: "cry",
        category: "Fun",
        description: "cry or make someone cry",
        usage: "cry",
        type: "slash", // or "slash"
        cooldown: 1
    },
    data: new SlashCommandBuilder()
        .setName("cry")
        .setDescription("Send a crying gif.")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to make cry.")
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser("user") ?? interaction.user;
        const cryGifs = [
            "https://i.imgur.com/OB50VDV.gif",
            "https://i.imgur.com/EuoGFE2.gif",
            "https://i.imgur.com/aNj3mv7.gif",
            "https://i.imgur.com/piQ9Yb0.gif",
            "https://i.imgur.com/ZMiEvse.gif"
        ];
        const selectedGif = cryGifs[Math.floor(Math.random() * cryGifs.length)];
        const cryEmbed = new EmbedBuilder()
            .setColor("#9C27B0")
            .setDescription(`${user} is crying...`)
            .setImage(selectedGif);

        await interaction.reply({ embeds: [cryEmbed] });
    },
};
