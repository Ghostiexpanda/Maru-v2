const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  config: {
    name: "lovemeter",
    category: "Fun",
    description: "Find out your love compatibility with someone",
    usage: "lovemeter <user1> <user2>",
    type: "slash", // or "slash"
    cooldown: 1
},
  data: new SlashCommandBuilder()
    .setName("lovemeter")
    .setDescription("Calculates the love compatibility between two users.")
    .addUserOption((option) =>
      option
        .setName("user1")
        .setDescription("The first user for the calculation.")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("user2")
        .setDescription("The second user for the calculation.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const user1 = interaction.options.getUser("user1");
    const user2 = interaction.options.getUser("user2");
    const lovePercentage = Math.floor(Math.random() * 101);
    const loveEmbed = new EmbedBuilder()
      .setColor("#FF69B4")
      .setTitle(`Love Compatibility between ${user1.username} and ${user2.username}`)
      .setDescription(`The love meter shows ${lovePercentage}% love!`)
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/789679406030583356/814004938139234816/heart.gif"
      );

    await interaction.reply({ embeds: [loveEmbed] });
  },
};
