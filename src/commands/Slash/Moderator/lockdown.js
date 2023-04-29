const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ChannelType, ButtonStyle, PermissionsBitField } = require('discord.js');
const lockdownschema = require('../../../schemas/lockdownblacklist');
 
module.exports = {
    config: {
        name: "lockdown",
        category: "Moderator",
        description: `locks/unlocks the entire server/ adds blacklisted channels to the lockdown`,
        usage: "lockdown",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDMPermission(false)
    .setDescription('Configure your lockdown system.')
    .addSubcommand(command => command.setName('blacklist-add').setDescription('Adds a channel to the blacklist. Blacklisted channels will not be effected by the lockdown.').addChannelOption(option => option.setName('channel').setRequired(true).setDescription('Specified channel will be added to the blacklist.')))
    .addSubcommand(command => command.setName('blacklist-remove').setDescription('Removes a channel from the blacklist. It will no longer be protected by the blacklist.').addChannelOption(option => option.setName('channel').setRequired(true).setDescription('Specified channel will be unadded from the blacklist.')))
    .addSubcommand(command => command.setName('commit').setDescription('Locks down your server. Use with caution!'))
    .addSubcommand(command => command.setName('unlock').setDescription('Unlockdowns your server.')),
    async execute(interaction) {
 
        const sub = interaction.options.getSubcommand();
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels) && interaction.user.id !== '619944734776885276') return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});
 
        switch (sub) {
            case 'blacklist-add':
 
            const blacklistchannel = interaction.options.getChannel('channel');
            const lockdata = await lockdownschema.findOne({ Guild: interaction.guild.id });
 
            if (!lockdata) {
 
                lockdownschema.create({
                    Guild: interaction.guild.id,
                    Channel: blacklistchannel.id
                })
 
                const blacklistadd1 = new EmbedBuilder()
                    .setColor('DarkRed')
                    .setAuthor({ name: `🛠 Lockdown Tool`})
                    .setFooter({ text: `🛠 Channel Added`})
                    .setTitle('> Channel Added to the \n> Blacklist!')
                    .setTimestamp()
                    .setThumbnail('https://cdn.discordapp.com/icons/1078641070180675665/c3ee76cdd52c2bba8492027dfaafa15d.webp?size=1024')
                    .addFields({ name: `• Blacklist Updated`, value: `> Your channel (${blacklistchannel}) has been \n> added to the blacklist, it will now \n> not be effected by any future \n> lockdowns.`})
 
                await interaction.reply({ embeds: [blacklistadd1] })
 
            } else {
 
                if (lockdata.Channel.includes(blacklistchannel.id)) return await interaction.reply({ content: `That channel is **already** blacklisted!`, ephemeral: true})
                else {
 
                    await lockdownschema.updateOne({ Guild: interaction.guild.id }, { $push: { Channel: blacklistchannel.id }});
 
                    const blacklistadd = new EmbedBuilder()
                    .setColor('DarkRed')
                    .setAuthor({ name: `🛠 Lockdown Tool`})
                    .setFooter({ text: `🛠 Channel Added`})
                    .setTitle('> Channel Added to the \n> Blacklist!')
                    .setTimestamp()
                    .setThumbnail('https://cdn.discordapp.com/icons/1078641070180675665/c3ee76cdd52c2bba8492027dfaafa15d.webp?size=1024')
                    .addFields({ name: `• Blacklist Updated`, value: `> Your channel (${blacklistchannel}) has been \n> added to the blacklist, it will now \n> not be effected by any future \n> lockdowns.`})
 
                    await interaction.reply({ embeds: [blacklistadd] })
                }
            }
 
            break;
            case 'blacklist-remove':
 
            const blacklistchannelremove = interaction.options.getChannel('channel');
            const lockdataremove = await lockdownschema.findOne({ Guild: interaction.guild.id });
 
            if (!lockdataremove) {
 
                await interaction.reply({ content: `The **blacklist** is **empty**, cannot remove **nothing**..`, ephemeral: true});
 
            } else {
 
                if (!lockdataremove.Channel.includes(blacklistchannelremove.id)) return await interaction.reply({ content: `That channel is **not** blacklisted!`, ephemeral: true})
                else {
 
                    await lockdownschema.updateOne({ Guild: interaction.guild.id }, { $pull: { Channel: blacklistchannelremove.id }});
 
                    const blacklistremove = new EmbedBuilder()
                    .setColor('DarkRed')
                    .setAuthor({ name: `🛠 Lockdown Tool`})
                    .setFooter({ text: `🛠 Channel Removed`})
                    .setTitle('> Channel Removed from \n> the Blacklist!')
                    .setTimestamp()
                    .setThumbnail('https://cdn.discordapp.com/icons/1078641070180675665/c3ee76cdd52c2bba8492027dfaafa15d.webp?size=1024')
                    .addFields({ name: `• Blacklist Updated`, value: `> Your channel (${blacklistchannelremove}) has been \n> removed to the blacklist, it will now \n> be effected by any future \n> lockdowns.`})
 
                    await interaction.reply({ embeds: [blacklistremove] })
                }
            }
 
            break;
            case 'commit':
 
            const lockdowndata = await lockdownschema.findOne({ Guild: interaction.guild.id });
 
            if (!lockdowndata) {
 
                const confirm = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('✅ Yes')
                    .setStyle(ButtonStyle.Success)
                    .setCustomId('confirm'),
 
                    new ButtonBuilder()
                    .setLabel('❌ No')
                    .setCustomId('decline')
                    .setStyle(ButtonStyle.Danger)
                )
 
                const lockmessage = await interaction.reply({ content: `No **lockdown blacklist** detected, are you **SURE** you want to lock all channels? This will cause your permissions to be **overwritten**!`, components: [confirm], ephemeral: true});
                const collector = lockmessage.createMessageComponentCollector();
 
                collector.on('collect', async (i, err) => {
 
                    if (i.customId === 'confirm') {
 
                        const lockchannels = interaction.guild.channels.cache.filter(channel => (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement || channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice || channel.type === ChannelType.GuildForum) && channel.type !== ChannelType.DM);
                        const lockids = lockchannels.map(channel => channel.id);
 
                        await lockids.forEach(async (channel, err) => {
                            const lockedchannel = interaction.guild.channels.cache.get(channel);
                            lockedchannel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false}).catch(err);
 
                        })
 
                        await i.update({ content: `Success!`, components: [], ephemeral: true})
                    }
 
                    if (i.customId === 'decline') {
 
                        await i.update({ content: `**Cancelled the operation.**`, components: [ ], ephemeral: true}).catch(err);
 
                    }
                })
 
            } else {
 
                const lockchannels1 = interaction.guild.channels.cache.filter(channel => (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement || channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice || channel.type === ChannelType.GuildForum) && channel.type !== ChannelType.DM);
                    const lockids1 = lockchannels1.map(channel => channel.id);
 
                    await lockids1.forEach(async (channel, err) => {
 
                    if (lockdowndata.Channel.includes(channel)) return;
 
                    const lockedchannel1 = interaction.guild.channels.cache.get(channel);
                    lockedchannel1.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false}).catch(err);
 
                })
 
                await interaction.reply({ content: 'Success!', ephemeral: true});
            }
 
            break;
            case 'unlock':
 
             const unlockdata = await lockdownschema.findOne({ Guild: interaction.guild.id });
 
             if (!unlockdata) {
 
                const confirm = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('✅ Yes')
                    .setStyle(ButtonStyle.Success)
                    .setCustomId('confirm'),
 
                    new ButtonBuilder()
                    .setLabel('❌ No')
                    .setCustomId('decline')
                    .setStyle(ButtonStyle.Danger)
                )
 
                const lockmessage = await interaction.reply({ content: `No **lockdown blacklist** detected, are you **SURE** you want to unlock all channels? This will cause your permissions to be **overwritten**!`, components: [confirm], ephemeral: true});
                const collector = lockmessage.createMessageComponentCollector();
 
                collector.on('collect', async (i, err) => {
 
                    if (i.customId === 'confirm') {
 
                        const lockchannels = interaction.guild.channels.cache.filter(channel => (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement || channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice || channel.type === ChannelType.GuildForum) && channel.type !== ChannelType.DM);
                        const lockids = lockchannels.map(channel => channel.id);
 
                        await lockids.forEach(async (channel, err) => {
                            const lockedchannel = interaction.guild.channels.cache.get(channel);
                            lockedchannel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true}).catch(err);
 
                        })
 
                        await i.update({ content: `Success!`, components: [], ephemeral: true})
                    }
 
                    if (i.customId === 'decline') {
 
                        await i.update({ content: `**Cancelled the operation.**`, components: [ ], ephemeral: true}).catch(err);
 
                    }
                })
 
            } else {
 
                const lockchannels1 = interaction.guild.channels.cache.filter(channel => (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement || channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice || channel.type === ChannelType.GuildForum) && channel.type !== ChannelType.DM);
                    const lockids1 = lockchannels1.map(channel => channel.id);
 
                    await lockids1.forEach(async (channel, err) => {
 
                    if (unlockdata.Channel.includes(channel)) return;
 
                    const lockedchannel1 = interaction.guild.channels.cache.get(channel);
                    lockedchannel1.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true}).catch(err);
 
                })
 
                await interaction.reply({ content: 'Success!', ephemeral: true});
            }
        }
    }
}