const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  config: {
    name: "kill",
    category: "Fun",
    description: "kill someone you hate",
    usage: "kill <user>",
    type: "slash", // or "slash"
    cooldown: 1
},
  data: new SlashCommandBuilder()
    .setName("kill")
    .setDescription("Send a killing gif to a user.")
    .addUserOption((option) =>
      option.setName("user")
      .setDescription("The user to send the killing gif to.")
      .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const killGifs = [
        "https://i.imgur.com/7et8lYx.gif",
        "https://i.imgur.com/Y9FsSXa.gif",
        "https://i.imgur.com/vUxYSTU.gif",
        "https://i.imgur.com/Tra6zBW.gif",
        "https://i.imgur.com/D30FBBu.gif",
        "https://i.imgur.com/XOYXT6u.gif"
    ];
    const selectedGif = killGifs[Math.floor(Math.random() * killGifs.length)];
    const killEmbed = new EmbedBuilder()
      .setColor("#FF0000")
      .setDescription(`${interaction.user} has killed ${user}!`)
      .setImage(selectedGif);

    await interaction.reply({ embeds: [killEmbed] });
  },
};
