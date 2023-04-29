const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { commandErrors } = require('../../../assets/handler/handleWebhook');

module.exports = {
    config: {
        name: "unban",
        category: "Moderator",
        description: `Unbans a specified user`,
        usage: "unban <user> (reason)",
        type: "slash", // or "slash"
        cooldown: 5
    },
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unbans a user from the server.')
    .addStringOption(option => option.setName('user').setDescription('The ID of the user to unban.').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('The reason for the unban.').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getString('user');
    const reason = interaction.options.getString('reason');
    const member = interaction.member;

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return interaction.reply({ content: `You do not have permissions **BanMembers** to use this command`, ephemeral: true})
    }

    try {
      await interaction.guild.bans.remove(user, { reason });

      const unbanEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('User unbanned')
        .setDescription(`Successfully unbanned user with ID ${user}`)
        .addFields(
            { name: 'Moderator', value: `${member.user.tag} (${member.user.id})` },
            { name: 'Reason', value: reason }
        );

      await interaction.reply({ embeds: [unbanEmbed] });
    } catch (error) {
        commandErrors('Command Error', error.message, error.stack, interaction.guild.id, interaction.guild.name, 'unban');
    }
  }
};
