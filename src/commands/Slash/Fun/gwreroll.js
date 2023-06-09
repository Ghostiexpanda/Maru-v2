const { SlashCommandBuilder } = require(`@discordjs/builders`);
const ms = require('ms');
const { mongoose } = require(`mongoose`)
const { PermissionsBitField } = require('discord.js')

module.exports = {
    config: {
        name: "gwreroll",
        category: "Fun",
        description: `rerolls a giveaway`,
        usage: "gwreroll <messageid>",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data:new SlashCommandBuilder()
    .setName(`gwreroll`)
    .setDescription(`Rerolls A Giveaway`)
    .addStringOption(option =>
        option
            .setName('message_id')
            .setDescription('The Message id Of the Giveaway')
            .setRequired(true)),
            
                    async execute(interaction, client) {

                        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                            return interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
                        }
                       
                        const query = interaction.options.getString('message_id');
const giveaway =
    // Search with giveaway prize
    client.giveawayManager.giveaways.find((g) => g.guildId === interaction.guildId && g.prize === query) ||
    // Search with messageId
    client.giveawayManager.giveaways.find((g) => g.guildId === interaction.guildId && g.messageId === query);

// If no giveaway was found
if (!giveaway) return interaction.reply(`Unable to find a giveaway for \`${query}\`.`);
const messageId = interaction.options.getString('message_id');
client.giveawayManager.reroll(messageId).then(() => {
                interaction.reply('Success! Giveaway rerolled!');
            })
            .catch((err) => {
                interaction.reply(`An error has occurred, please check and try again.\n\`${err}\``);
            });
                    }

}