const { SlashCommandBuilder } = require(`@discordjs/builders`);
const ms = require('ms');
const { mongoose } = require(`mongoose`)
const { PermissionsBitField } = require('discord.js')

module.exports = {
    config: {
        name: "gwstart",
        category: "Fun",
        description: `starts a giveaway`,
        usage: "gwstart",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data:new SlashCommandBuilder()
    .setName(`gwstart`)
    .setDescription(`Starts A Giveaway`)
    .addStringOption(option =>
        option
            .setName('duration')
            .setDescription('The duration of the giveaway In Milliseconds')
            .setRequired(true))
    .addIntegerOption(option =>
        option
            .setName('winners')
            .setDescription('The Amount Of Winners')
            .setRequired(true))
            .addStringOption(option =>
                option
                    .setName('prize')
                    .setDescription('The prize For The Giveaway')
                    .setRequired(true))
                    .addChannelOption(option =>
                        option
                            .setName('channel')
                            .setDescription('The channel for  The Giveaway'))
                            .addStringOption(option =>
                                option
                                    .setName('content')
                                    .setDescription('The Content Of The Giveaway')),



                    async execute(interaction, bot) {

                        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                            return interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
                        }

                        if(!mongoose.connect) await interaction.reply(`no Mongodb Url Provided`)

                        await interaction.reply({ content: `Starting Giveaway`, ephemeral: true })
                        
                        const { GiveawaysManager } = require("discord-giveaways");

                        
                        const duration = ms(interaction.options.getString("duration") || "")
        const winnerCount = interaction.options.getInteger('winners');
        const prize = interaction.options.getString('prize');
        const contentmain = interaction.options.getString(`content`);
        const channel = interaction.options.getChannel("channel")
        if (!channel && !contentmain)
        bot.giveawayManager.start(interaction.channel, {
            prize,
            winnerCount,
            duration,
            hostedBy: interaction.user,
            lastChance: {
                enabled: false,
                content: contentmain,
                threshold: 60000000000_000,
                embedColor: '#FF0000'
            }
        });

        else if (!channel)
        bot.giveawayManager.start(interaction.channel, {
            prize,
            winnerCount,
            duration,
            hostedBy: interaction.user,
            lastChance: {
                enabled: true,
                content: contentmain,
                threshold: 60000000000_000,
                embedColor: '#FF0000'
            }
        });
        else if (!contentmain)
        bot.giveawayManager.start(channel, {
            prize,
            winnerCount,
            duration,
            hostedBy: interaction.user,
            lastChance: {
                enabled: false,
                content: contentmain,
                threshold: 60000000000_000,
                embedColor: '#FF0000'
            }
        });
        else 
        bot.giveawayManager.start(channel, {
            prize,
            winnerCount,
            duration,
            hostedBy: interaction.user,
            lastChance: {
                enabled: true,
                content: contentmain,
                threshold: 60000000000_000,
                embedColor: '#FF0000'
            }
        });

        interaction.editReply({ content:`Giveaway Started`, ephemeral: true })
                    }

}