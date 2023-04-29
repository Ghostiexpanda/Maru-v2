const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { commandErrors } = require('../../../assets/handler/handleWebhook');

module.exports = {
    config: {
        name: "bug",
        category: "misc",
        description: "Enables users to report any bugs or errors they have encountered while using the bot. This helps the bot owner to identify and fix any issues that may be impacting the bot's performance.",
        usage: "bug",
        type: "slash", // or "slash"
        cooldown: 10
    },
    data: new SlashCommandBuilder()
        .setName('bug')
        .setDescription('Use the \`bug\` command to report any issues or bugs you encounter while playing our game.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Type your report here.')
                .setRequired(true)),

    async execute(interaction, bot) {

        try {
            const query = interaction.options.getString('query');

            const guildName = interaction.guild.name
            const guildId = interaction.guild.id

            const bugEmbed = new EmbedBuilder()
                .setColor(bot.colors.red)
                .setTitle(`New Bug Report from ${interaction.user.tag}`)
                .setDescription(query)
                .setTimestamp()
                .addFields({ name: `❯ Server Name:`, value: `${guildName}`, inline: true }, { name: `❯ Server ID:`, value: `${guildId}`, inline: true })

            const targetGuildId = bot.discord.guildId
            const targetGuild = bot.guilds.cache.get(targetGuildId)
            const staffChannel = targetGuild.channels.cache.get(bot.discord.bugChannel)

            if (staffChannel) {
                staffChannel.send({ embeds: [bugEmbed] });
                await interaction.reply({ content: 'Thanks for submitting a bug report! Your help in improving the game is appreciated.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'The bug-channel could not be found. Please contact the server administrators.', ephemeral: true });
            }
        } catch (error) {
            commandErrors('Command Error', error.message, error.stack, interaction.guild.id, interaction.guild.name, 'bug');
        }
    }
};