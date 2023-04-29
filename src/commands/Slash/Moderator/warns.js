const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, PermissionsBitField } = require('discord.js');
const warningSchema = require('../../../schemas/warnings.js');

module.exports = {
  config: {
    name: "warns",
    category: "Moderator",
    description: `Check a users warnings`,
    usage: "warns <user>",
    type: "slash", // or "slash"
    cooldown: 5
},
  data: new SlashCommandBuilder()
    .setName('warns')
    .setDescription("Displays a user's warnings")
    .addUserOption(option =>
      option.setName('target').setDescription('The user to view warnings for').setRequired(true),
    ),
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    if (!target) return interaction.reply({ content: 'Please specify a user to view their warnings', ephemeral: true });

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
  }
    const warningData = await warningSchema.findOne({ User: target.id, Guild: interaction.guild.id });
    if (!warningData || !warningData.Warnings.length) return interaction.reply({ content: `${target.username} has no warnings`, ephemeral: true });

    let page = 0;
    const maxPage = Math.ceil(warningData.Warnings.length / 5) - 1;

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('previous')
          .setLabel('Previous')
          .setStyle('Danger')
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle('Primary')
          .setDisabled(warningData.Warnings.length <= 5),
      );

      const startIndex = page * 5;
      const pageWarnings = warningData.Warnings.slice(startIndex, startIndex + 5);
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${target.username}'s Warnings`)
        .setDescription(
          pageWarnings.map((warningData) => {
            return `**Warning #${warningData.warn_id}**
            Moderator: <@${warningData.moderator_id}>
            Reason: ${warningData.reason}
            Timestamp: ${warningData.timestamp}`;
          }).join('\n\n'),
        );
  
      const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    const filter = (i) => ['previous', 'next'].includes(i.customId) && i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (i) => {
      if (i.customId === 'previous') {
        page--;
      } else if (i.customId === 'next') {
        page++;
      }

      // Update button disabled states
      row.components[0].setDisabled(page === 0);
      row.components[1].setDisabled(page === maxPage);

      // Update embed with current page of warnings
      const startIndex = page * 5;
      const pageWarnings = warningData.Warnings.slice(startIndex, startIndex + 5);
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${target.username}'s Warnings`)
        .setDescription(
          pageWarnings.map((warningData) => {
            return `**Warning #${warningData.warn_id}**
            Moderator: <@${warningData.moderator_id}>
            Reason: ${warningData.reason}
            Timestamp: ${warningData.timestamp}`;
          }).join('\n\n'),
        );

      await i.update({ embeds: [embed], components: [row] });
    });
  },
};
