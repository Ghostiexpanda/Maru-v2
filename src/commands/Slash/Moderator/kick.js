const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    config: {
        name: "kick",
        category: "Moderator",
        description: `Kicks a user`,
        usage: "kick",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a member')
        .addUserOption(option => option.setName('member').setDescription('Member to kick').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for kicking')),
        async execute(interaction, client) {

            const kickUser = interaction.options.getUser('member');
            const kickMember = await interaction.guild.members.fetch(kickUser.id);
            const channel = interaction.channel;

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
                return interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
            }
            if (!kickMember) {
                return await interaction.reply({ content: 'You must specify a member to kick', ephemeral: true });
            }
            if  (!kickMember.kickable) {
                return await interaction.reply({ content: 'I cannot kick this member', ephemeral: true });
            }

            let reason = interaction.options.getString('reason');
            if (!reason) reason = 'No reason given';

            const dmEmbed = new EmbedBuilder()
            .setColor("Red")
            .setDescription(`You have been kicked from ${interaction.guild.name} | Reason: ${reason}`)
            .setTimestamp()

            const embed = new EmbedBuilder()
            .setColor("Red")
            .setDescription(`:white_check_mark: ${kickUser.tag} has been kicked | Reason: ${reason}`)
            .setTimestamp()


            await kickMember.send({ embeds: [dmEmbed] }).catch(err => {
                console.error(err);
            });

            await kickMember.kick(reason).catch(err => {
                return;
                interaction.reply({ content: 'There was an error trying to kick this member!', ephemeral: true });
            });

            await interaction.reply({ embeds: [embed] });
        }
    }
   
   