const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  config: {
    name: "ping",
    category: "misc",
    description: `Checks the bots ping`,
    usage: "ping",
    type: "slash", // or "slash"
    cooldown: 5
},
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Checks the bot\'s ping.'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Pinging...')
      .setTimestamp();

    const sent = await interaction.reply({ embeds: [embed], fetchReply: true });

    const ping = sent.createdTimestamp - interaction.createdTimestamp;

    const newEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Pong!')
      .setDescription(`Bot latency: ${ping}ms\nAPI latency: ${interaction.client.ws.ping}ms`)
      .setTimestamp();

    await sent.edit({ embeds: [newEmbed] });
  },
};
