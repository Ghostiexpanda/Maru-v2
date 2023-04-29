const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const afkSchema = require('../../../schemas/afkSchema');
const { commandErrors } = require('../../../assets/handler/handleWebhook');

module.exports = {

    config: {
        name: "afk",
        category: "Moderator",
        description: `Go afk.`,
        usage: "afk (message)",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set your afk status')
        .addSubcommand(command => command.setName('set').setDescription('Set your afk status').addStringOption(option => option.setName('message').setDescription('The reason for being afk').setRequired(false)))
        .addSubcommand(command => command.setName('remove').setDescription('Remove you afk status')),

    async execute(interaction) {
        try {
        const { options } = interaction;
        const sub = options.getSubcommand();

        const Data = await afkSchema.findOne({
            Guild: interaction.guild.id,
            User: interaction.user.id
        });

        switch (sub) {
            case 'set':

            if (Data) return await interaction.reply({ content: 'You are already afk!', ephemeral: true });
            else {
                const message = options.getString('message');
                const nickname = interaction.member.nickname || interaction.user.username;
                await afkSchema.create({
                    Guild: interaction.guild.id,
                    User: interaction.user.id,
                    Message: message,
                    Nickname: nickname
                })

                const name = `[AFK] ${nickname}`;
                await interaction.member.setNickname(`${name}`).catch(err => {
                    return;
                })

                const embed = new EmbedBuilder()
                .setColor("Blue")
                .setDescription("You are now afk! Send a message or do /remove to remove your afk status!")

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            break;

            case 'remove':

            if (!Data) return await interaction.reply({ content: 'You are not afk!', ephemeral: true });
            else {
                const nick = Data.Nickname;
                await afkSchema.deleteMany({
                    Guild: interaction.guild.id,
                    User: interaction.user.id
                })

                await interaction.member.setNickname(`${nick}`).catch(err => {
                    return;
                })

                const embed = new EmbedBuilder()
                .setColor("Blue")
                .setDescription("You are no longer afk!")

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    } catch (error) {
        commandErrors('Command Error', error.message, error.stack, interaction.guild.id, interaction.guild.name, 'afk');
    }
}
}