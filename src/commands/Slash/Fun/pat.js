const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  config: {
    name: "pat",
    category: "Fun",
    description: `Pat someone`,
    usage: "pat <user>",
    type: "slash", // or "slash"
    cooldown: 5
},
  data: new SlashCommandBuilder()
    .setName("pat")
    .setDescription("Send a pat gif to a user.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user to send the pat to.")
        .setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const patGifs = [
      "https://i.imgur.com/kKUnMaU.gif",
      "https://i.imgur.com/XSuRcrV.gif",
      "https://i.imgur.com/OU1zbB5.gif",
      "https://i.imgur.com/4tMO5jz.gif",
      "https://i.imgur.com/cHULsXv.gif",
      "https://i.imgur.com/Pgtlait.gif",
      "https://i.imgur.com/GkGYquz.gif",
      "https://i.imgur.com/A79xISB.gif",
      "https://i.imgur.com/16o2ntn.gif",
      "https://i.imgur.com/26BIaUj.gif",
    ];
    const selectedGif = patGifs[Math.floor(Math.random() * patGifs.length)];
    const patEmbed = new EmbedBuilder()
      .setColor("#FF69B4")
      .setDescription(`${interaction.user} has patted ${user}!`)
      .setImage(selectedGif);

    await interaction.reply({ embeds: [patEmbed] });
  },
};
