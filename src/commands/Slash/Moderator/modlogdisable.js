const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const Modlog = require('../../../schemas/modlog');

module.exports = {
    config: {
        name: "disablemodlog",
        category: "Moderator",
        description: `disables modlog`,
        usage: "disablemodlog [options]",
        type: "slash",
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('disablemodlog')
        .setDescription('Disables the mod log channel for this server.')
        .addStringOption(option => option.setName('options').setDescription('The logs to disable')
        .addChoices(
            { name: 'All', value: 'all'},
            { name: 'Message Deletes', value: 'messageDelete'},
            { name: 'Message Bulk Deletes', value: 'messageDeleteBulk'},
            { name: 'Message Edits', value: 'messageEdits'},
            { name: 'Member Kicks', value: 'memberKicks'},
            { name: 'Member Bans', value: 'memberBans'},
            { name: 'Member Unbans', value: 'memberUnbans'},
            { name: 'Message Joins', value: 'messageJoins'},
            { name: 'Message Leaves', value: 'messageLeaves'},
            { name: 'Nickname Update', value: 'nicknameUpdate'},
            { name: 'Name Update', value: 'nameUpdate'},
            { name: 'Name Update', value: 'avatarChanged'},
            { name: 'Invite Creation', value: 'inviteCreated'},
            { name: 'Roles added to members', value: 'roleAdded'},
            { name: 'Roles Removed from members', value: 'roleRemoved'},
            { name: 'Channel Creates', value: 'channelCreates'},
            { name: 'Channel Updates', value: 'channelUpdates'},
            { name: 'Channel Deletes', value: 'channelDeletes'},
            { name: 'Role Creates', value: 'roleCreates'},
            { name: 'Role Updates', value: 'roleUpdates'},
            { name: 'Role Deletes', value: 'roleDeletes'},
            { name: 'Emoji Creates', value: 'emojiCreates'},
            { name: 'Emoji Deletes', value: 'emojiDeletes'},
            { name: 'Sticker Creates', value: 'stickerCreates'},
            { name: 'Sticker Deletes', value: 'stickerDeletes'},
        )
        ),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const options = interaction.options.getString('options');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        try {
            const modlog = await Modlog.findOne({ guildId });
            if (!modlog) {
                return interaction.reply({ content: 'Mod log channel has not been set up yet.', ephemeral: true });
            }

            if (options && options !== 'all') {
                // Remove specified option(s)
                const updatedOptions = modlog.options.filter(option => !options.includes(option));
                modlog.options = updatedOptions;
                await modlog.save();

                const embed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("Moderation logs Maru v2")
                .setDescription("Mod log options updated")
                .addFields({ name: "Updated Enabled Logs", value: `${updatedOptions.join(', ')}`, inline: true})
                .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
                .setTimestamp()
                .setFooter({ text: "Mod Logging by Maru v2" });
  
               interaction.reply({ embeds: [embed] });
            } else {
                // Remove entire mod log entry
                await Modlog.findOneAndDelete({ guildId });
                return interaction.reply(`Mod log channel disabled.`);
            }
        } catch (error) {
            console.error(error);
            return interaction.reply('An error occurred while disabling the mod log channel');
        }
    },
};
