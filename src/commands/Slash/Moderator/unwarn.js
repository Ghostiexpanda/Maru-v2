const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const warningSchema = require('../../../schemas/warnings.js');
const { commandErrors } = require('../../../assets/handler/handleWebhook');
 
module.exports = {
  config: {
    name: "unwarn",
    category: "Moderator",
    description: `Unwarn a user`,
    usage: "unwarn <user> <warnId>",
    type: "slash", // or "slash"
    cooldown: 5
},
  data: new SlashCommandBuilder()
    .setName('unwarn')
    .setDescription('Removes a warning from a user')
    .addUserOption(option => option.setName('user').setDescription('The user to remove a warning from').setRequired(true))
    .addIntegerOption(option => option.setName('warn-id').setDescription('The ID of the warning to remove').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const warnId = interaction.options.getInteger('warn-id');

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
  }

    try {
      const warnings = await warningSchema.findOne({ User: user.id, Guild: interaction.guild.id });
      if (!warnings) {
        return await interaction.reply('This user has no warnings.');
      }

      const warningIndex = warnings.Warnings.findIndex(warning => warning.warn_id === warnId);
      if (warningIndex === -1) {
        return await interaction.reply(`There is no warning with ID ${warnId} for this user.`);
      }

      const removedWarning = warnings.Warnings.splice(warningIndex, 1)[0];
      await warnings.save();

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(`Removed Warning #${removedWarning.warn_id}`)
        .setDescription(`User: <@${user.id}> \nModerator: <@${interaction.member.id}> \nReason: ${removedWarning.reason}`)
        .setTimestamp(new Date());

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      commandErrors('Command Error', error.message, error.stack, interaction.guild.id, interaction.guild.name, 'unwarn');
  }
  }
};
