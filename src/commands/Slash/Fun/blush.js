const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    config: {
        name: "blush",
        category: "Fun",
        description: `Blush at someone`,
        usage: "blush <user>",
        type: "slash", // or "slash"
        cooldown: 5
    },
  data: new SlashCommandBuilder()
    .setName("blush")
    .setDescription("Blush at someone special.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to blush at.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const blushGifs = [
      "https://i.imgur.com/1BNM6QG.gif",
      "https://i.imgur.com/xAqtIKg.gif",
      "https://i.imgur.com/KFt5cXL.gif",
      "https://i.imgur.com/sQWEnhD.gif",
      "https://i.imgur.com/rVMOVvX.gif",
      "https://i.imgur.com/Rj9Zng8.gif",
    ];
    const selectedGif =
      blushGifs[Math.floor(Math.random() * blushGifs.length)];

    const embed = new EmbedBuilder()
      .setColor("#FFB6C1")
      .setDescription(`${interaction.user} is blushing at ${user}!`)
      .setImage(selectedGif);

    await interaction.reply({ embeds: [embed] });
  },
};
