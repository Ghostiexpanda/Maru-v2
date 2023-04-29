const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const { commandErrors } = require('../../../assets/handler/handleWebhook');

module.exports = {
    config: {
        name: "unlock",
        category: "Moderator",
        description: `Unlocks a specific channel`,
        usage: "unlock <channel>",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('unlocks a channel')
        .addChannelOption(option => option.setName('channel').setDescription('Channel to unlock').addChannelTypes(ChannelType.GuildText).setRequired(true)),
        async execute(interaction) {

            try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
            }

            let channel = interaction.options.getChannel('channel');

            channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: true });

            const embed = new EmbedBuilder()
            .setColor("Blue")
            .setDescription(`:white_check_mark: unlocked **${channel}**`)
            .setTimestamp()

            await interaction.reply({ embeds: [embed] }).catch(err => {
                console.error(err);
        });

    } catch (error) {
        commandErrors('Command Error', error.message, error.stack, interaction.guild.id, interaction.guild.name, 'unlock');
    }
        }
}