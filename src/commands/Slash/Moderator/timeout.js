const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

const { commandErrors } = require('../../../assets/handler/handleWebhook');

module.exports = {

    config: {
        name: "timeout",
        category: "Moderator",
        description: `Timeout a user for a specified amount of time.`,
        usage: "timeout <user> <duration> <reason>",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeouts a user')
        .addUserOption(option => option.setName('user').setDescription('The user to timeout').setRequired(true))
        .addIntegerOption(option => option.setName('duration').setDescription('The time to timeout the user for').setRequired(true).addChoices(
            { name: '60 Seconds', value: 60 },
            { name: '2 Minutes', value: 120 },
            { name: '5 Minutes', value: 300 },
            { name: '10 Minutes', value: 600 },
            { name: '15 Minutes', value: 900 },
            { name: '30 Minutes', value: 1800 },
            { name: '45 Minutes', value: 2700 },
            { name: '1 Hour', value: 3600 },
            { name: '2 Hours', value: 7200 },
            { name: '3 Hours', value: 10800 },
            { name: '5 Hours', value: 18000 },
            { name: '10 Hours', value: 36000 },
            { name: '1 Day', value: 86400 },
            { name: '2 Days', value: 172800 },
            { name: '3 Days', value: 259200 },
            { name: '5 Days', value: 432000 },
            { name: '1 Week', value: 604800 }
        ))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the timeout')),

    async execute(interaction) {

        try {
        const timeUser = interaction.options.getUser('user');
        const timeMember = await interaction.guild.members.fetch(timeUser.id);
        const duration = interaction.options.getInteger('duration');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
        }
        if (!timeMember) return await interaction.reply({ content: 'The user mentioned is no longer in the server', ephemeral: true });
        if (interaction.member.id === timeMember.id) return await interaction.reply({ content: 'You cannot timeout yourself', ephemeral: true });
        if (timeMember.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: 'You cannot timeout this user!', ephemeral: true });
        }
        if (interaction.guild === null) return;

        let reason = interaction.options.getString('reason') || 'No reason provided';
        await timeMember.timeout( duration * 1000, reason);

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setDescription(`:white_check_mark: ${timeUser.tag} has been timed out for ${duration / 60} minute(s) for ${reason}`);
            

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        commandErrors('Command Error', error.message, error.stack, interaction.guild.id, interaction.guild.name, 'timeout');
    }
    }
}
