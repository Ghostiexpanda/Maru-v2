const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js')
const levelSchema = require('../../../schemas/level.js');


module.exports = {
    config: {
        name: "xp-reset",
        category: "Moderator",
        description: `Resets the xp for the server`,
        usage: "xp-reset",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('xp-reset')
        .setDescription('Resets the XP for everyone!'),
        async execute(interaction) {
            const perm = new EmbedBuilder()
                .setColor('Blue')
                .setDescription(':x: You do not have permission to use this command!');
        
            if (!interaction.member.permissions.has('Administrator')) {
                return interaction.reply({ embeds: [perm], ephemeral: true });
            }
        
            const { guildId } = interaction;
        
            try {
                const data = await levelSchema.deleteMany({ Guild: guildId });
        
                const embed = new EmbedBuilder()
                    .setColor('Blue')
                    .setDescription(`:white_check_mark: The XP for everyone has been reset!`);
        
                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error(error);
                // Handle the error
            }
        }
    }        