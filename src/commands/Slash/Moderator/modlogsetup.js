const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const Modlog = require('../../../schemas/modlog');

module.exports = {
    config: {
        name: "setmodlog",
        category: "Moderator",
        description: `sets up modlog`,
        usage: "modlog channel",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('setmodlog')
        .setDescription('Sets up the mod log channel for this server.')
        .addChannelOption(option => option.setName('channel').setDescription('The channel to set as the mod log channel').setRequired(true))
        .addStringOption(option => option.setName('options').setDescription('The logs to enable').setRequired(true)
          .addChoices(
            { name: 'All Logs', value: 'allLogs' },
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
            { name: 'Avatar Update', value: 'avatarChanged'},
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
          ).setRequired(true)
        ),
        async execute(interaction) {
            const guildId = interaction.guild.id;
            const logChannelId = interaction.options.getChannel('channel').id;
            const options = interaction.options.getString('options');
            let optionsArray = options.split(',').map(opt => opt.trim());
          
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
              return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            }
          
            try {
              let modlog = await Modlog.findOne({ guildId });
              if (!modlog) {
                modlog = new Modlog({ guildId });
              }
              if (options === 'allLogs') {
                optionsArray = ['messageDelete', 'messageDeleteBulk', 'messageEdits', 'memberKicks', 'memberBans', 'memberUnbans', 'memberJoins', 'memberLeaves', 'nicknameUpdate', 'nameUpdate', 'avatarChanged',  'inviteCreated', 'roleAdded', 'roleRemoved', 'channelCreates', 'channelUpdates', 'channelDeletes', 'roleCreates', 'roleUpdates', 'roleDeletes', 'emojiCreates', 'emojiDeletes', 'stickerCreates', 'stickerDeletes'];
                modlog.options = optionsArray;
              } else {
                optionsArray.forEach(option => {
                  if (!modlog.options.includes(option)) {
                    modlog.options.push(option);
                  }
                });
              }
                         
          
              modlog.logChannelId = logChannelId;
              await modlog.save();
          
              const embed = new EmbedBuilder()
              .setColor("Red")
              .addFields({ name: "Logging Channel", value: `Mod log channel set to <#${logChannelId}>`, inline: false})
              .addFields({ name: "Enabled Logs", value: `${modlog.options.join(', ')}`, inline: true})
              .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
              .setTimestamp()
              .setFooter({ text: "Mod Logging by Maru v2" });

             interaction.reply({ embeds: [embed] });
            } catch (error) {
              console.error(error);
              return interaction.reply('An error occurred while setting up the mod log channel');
            }
          }
        };
