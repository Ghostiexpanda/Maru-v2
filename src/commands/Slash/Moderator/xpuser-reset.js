const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js')
const levelSchema = require('../../../schemas/level.js');

module.exports = {
    config: {
        name: "xpuser-reset",
        category: "Moderator",
        description: `Resets the xp for a user`,
        usage: "xpuser-reset",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('xpuser-reset')
        .setDescription('Resets the XP of a user!')
        .addUserOption(option => option.setName('user').setDescription('The user you want to reset xp of').setRequired(true)),
    async execute(interaction) {
        const perm = new EmbedBuilder()
            .setColor('Blue')
            .setDescription(':x: You do not have permission to use this command!');
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ embeds: [perm], ephemeral: true });
        }

        const { guildId } = interaction;
        const target = interaction.options.getMember('user');

        try {
            const data = await levelSchema.deleteMany({ Guild: guildId, User: target.id });
            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setDescription(`:white_check_mark: Successfully reset ${target.user.tag}'s XP!`);
            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            const embed = new EmbedBuilder()
                .setColor('RED')
                .setDescription(':x: An error occurred while resetting XP!');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
}
