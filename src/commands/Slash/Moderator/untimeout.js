const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { commandErrors } = require('../../../assets/handler/handleWebhook');

module.exports = {

    config: {
        name: "untimeout",
        category: "Moderator",
        description: `Untimes out a specified user`,
        usage: "timeout <user> <reason>",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('untimeouts a user')
        .addUserOption(option => option.setName('user').setDescription('The user to remove timeout from').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for removing timeout')),

    async execute(interaction) {
        try {
        const timeUser = interaction.options.getUser('user');
        const timeMember = await interaction.guild.members.fetch(timeUser.id);

        if (!interaction.member || !interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
        }
        if (!timeMember) return await interaction.reply({ content: 'The user mentioned is no longer in the server', ephemeral: true });
        if (interaction.member.id === timeMember.id) return await interaction.reply({ content: 'You cannot untimeout yourself', ephemeral: true });
        if (timeMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'You cannot timeout this user!', ephemeral: true });
        }

        let reason = interaction.options.getString('reason') || 'No reason provided';
        await timeMember.timeout(null, reason)

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setDescription(`:white_check_mark: ${timeUser.tag} has been untimeouted for ${reason}`);

            const dmEmbed = new EmbedBuilder()
            .setColor('Blue')
            .setDescription(`:white_check_mark: You have been untimeouted in ${interaction.guild.name} for ${reason}`);

            await timeMember.send({ embeds: [dmEmbed] }).catch(err => {
                return;
            });

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        commandErrors('Command Error', error.message, error.stack, interaction.guild.id, interaction.guild.name, 'untimeout');
    }
    }
}
