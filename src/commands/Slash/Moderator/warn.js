const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const warningSchema = require('../../../schemas/warnings.js');
const { commandErrors } = require('../../../assets/handler/handleWebhook');

module.exports = {
  config: {
    name: "warn",
    category: "Moderator",
    description: `Warn a user`,
    usage: "warn <user> <reason>",
    type: "slash", // or "slash"
    cooldown: 5
  },
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warns a user')
    .addUserOption(option => option.setName('user').setDescription('The user to warn').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('The reason for the warning').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
    }

    // Filter the user by guild ID
    const guildUsers = await interaction.guild.members.fetch();
    const filteredUser = guildUsers.find(member => member.user.id === user.id);

    // Check if the user is a member of the current guild
    if (!filteredUser) {
      return interaction.reply({ content: 'This user is not a member of this guild', ephemeral: true });
    }

    try {
      const warnings = await warningSchema.findOne({ User: filteredUser.id, Guild: interaction.guild.id});
      const numWarnings = warnings ? warnings.Warnings.length : 0;

      const newWarning = {
        warn_id: numWarnings + 1,
        moderator_id: interaction.member.id,
        reason: reason,
        timestamp: new Date()
      };

      if (!warnings) {
        await warningSchema.create({
          User: filteredUser.id,
          Guild: interaction.guild.id,
          Warnings: [newWarning]
        });
      } else {
        warnings.Warnings.push(newWarning);
        await warnings.save();
      }

      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle(`Warning #${numWarnings + 1}`)
        .setDescription(`User: <@${filteredUser.id}> \nModerator: <@${interaction.member.id}> \nReason: ${reason}`)
        .setTimestamp(newWarning.timestamp);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      commandErrors('Command Error', error.message, error.stack, interaction.guild.id, interaction.guild.name, 'warn');
    }
  }
};
