const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  config: {
    name: "smile",
    category: "Fun",
    description: "Smile at someone",
    usage: "smile <user>",
    type: "slash", // or "slash"
    cooldown: 1
},
  data: new SlashCommandBuilder()
    .setName("smile")
    .setDescription("Send a happy gif to a user.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user to send the gif to.")
        .setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const happyGifs = [
      "https://i.imgur.com/SodoNpq.gif",
      "https://i.imgur.com/6MXtJ8g.gif"
    ];
    const selectedGif = happyGifs[Math.floor(Math.random() * happyGifs.length)];
    const happyEmbed = new EmbedBuilder()
      .setColor("#FF69B4")
      .setDescription(`${interaction.user} has smiled at ${user}!`)
      .setImage(selectedGif);

    await interaction.reply({ embeds: [happyEmbed] });
  },
};
