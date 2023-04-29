const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const { commandErrors } = require('../../../assets/handler/handleWebhook');

module.exports = {
    config: {
        name: "lock",
        category: "Moderator",
        description: `Locks a channel and prevents messages from being sent`,
        usage: "lock <channel>",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Locks a channel')
        .addChannelOption(option => option.setName('channel').setDescription('Channel to lock').addChannelTypes(ChannelType.GuildText).setRequired(true)),
        async execute(interaction) {

            try{
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
            }

            let channel = interaction.options.getChannel('channel');

            channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });

            const embed = new EmbedBuilder()
            .setColor("Blue")
            .setDescription(`:white_check_mark: Locked **${channel}**`)
            .setTimestamp()

            await interaction.reply({ embeds: [embed] }).catch(err => {
                console.error(err);
        });
    } catch (error) {
        commandErrors('Command Error', error.message, error.stack, interaction.guild.id, interaction.guild.name, 'lock');
    }
        }
}