const { SlashCommandBuilder } = require(`@discordjs/builders`);
const ms = require('ms');
const { mongoose } = require(`mongoose`)
const { PermissionsBitField } = require('discord.js')

module.exports = {
    config: {
        name: "gwend",
        category: "Fun",
        description: `Ends the giveaway`,
        usage: "gwend <messageid>",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data:new SlashCommandBuilder()
    .setName(`gwend`)
    .setDescription(`Ends A Giveaway`)
    .addStringOption(option =>
        option
            .setName('message_id')
            .setDescription('The Message id For Giveaway')
            .setRequired(true)),

                    async execute(interaction, client) {

                        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                            return interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
                        }

                        const messageId = interaction.options.getString('message_id');
                        client.giveawayManager
            .end(messageId)
            .then(() => {
                interaction.reply('Success! Giveaway ended!');
            })
            .catch((err) => {
                interaction.reply(`An error has occurred, please check and try again.\n\`${err}\``);
            });

                    }

}