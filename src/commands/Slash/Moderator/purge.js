const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { PermissionsBitField } = require('discord.js');
const { commandErrors } = require('../../../assets/handler/handleWebhook');

module.exports = {
    config: {
        name: "purge",
        category: "Moderator",
        description: `Clears a certain amount of messages`,
        usage: "purge <amount>",
        type: "slash", // or "slash"
        cooldown: 5
    },

    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Clears messages')
        .addIntegerOption(option => option.setName('amount').setDescription('Amount of messages to clear').setMinValue(1).setMaxValue(100).setRequired(true)),
    async execute(interaction, bot) {
        try {
        const amount = interaction.options.getInteger('amount');
        const channel = interaction.channel;

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
        }
        if (!amount) {
            return interaction.reply({ content: 'You must specify an amount of messages to clear', ephemeral: true });
        }
        if (amount > 100 || amount < 1) {
            return interaction.reply({ content: 'You can only clear 100 messages at a time', ephemeral: true });
        }

        await channel.bulkDelete(amount, true).catch(err => {
            console.error(err);
            interaction.reply({ content: 'There was an error trying to clear messages in this channel!', ephemeral: true });
        });

        const embed = new EmbedBuilder()
        .setColor("Blue")
        .setDescription(`:white_check_mark: Deleted **${amount}** messages`)

        await interaction.reply({ embeds: [embed] }).catch(err => {
            console.error(err);
    });
} catch (error) {
    commandErrors('Command Error', error.message, error.stack, interaction.guild.id, interaction.guild.name, 'purge');
}
  }
} 
