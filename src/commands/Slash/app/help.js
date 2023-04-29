const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

const { readdirSync } = require("fs");
const { commandErrors } = require('../../../assets/handler/handleWebhook');

module.exports = {
    config: {
        name: "help",
        category: "app",
        description: `The \`/help\` command is a common command in many Discord bots that allows users to view a list of available commands and their descriptions.\n\nUsers can also use \`/help [command name]\` to get more information about a specific command.\n\nThis command is especially helpful for new users who are not familiar with the bot's commands and functionalities.`,
        usage: "help",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all the commands available')
        .addStringOption((option) => option.setName("command").setDescription("To obtain more information about a specific command, type its name.")),
    async execute(interaction, bot) {

        var date = new Date();
        date = date.toLocaleString();

        const primaryPrefix = bot.discord.primaryPrefix
        const secondaryPrefix = bot.discord.secondaryPrefix

        const embed = new EmbedBuilder()
            .setColor(bot.colors.embedColor)
            .setAuthor({ name: `${bot.discord.botusername} Help`, iconURL: interaction.guild.iconURL({ size: 2048, dynamic: true }) })
            .setThumbnail(bot.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }));

        const helpOptions = [
            {
                label: 'Commands List',
                description: 'A list of all the commands.',
                value: 'commandlist',
                emoji: '<:list:1080877603273056287>'
            },
        ]
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`command-selection_${interaction.user.id}`)
                    .setPlaceholder('Select a category to view commands.')
                    .addOptions(helpOptions));

        const commandName = interaction.options.getString("command")

        if (!commandName) {


            embed.setDescription(`These are the available commands for ${bot.discord.botusername}\nThe bot prefix is \`${primaryPrefix}\` or \`${secondaryPrefix}\`\n
            For arguements in commands: 
            \`[]\` means it's required
            \`()\` means it's opitional
            Dont use the dropdown because all commands already displayed
            Do not actually include the \`[]\` & \`()\` symbols in the command\n\nWe are not using slash for all commands to avoid the limit but you can always use \`/bug\` to report a bug.`)
            embed.setFooter({ text: `Total Command: ${bot.commands.size} | Requested at: ${date}`, iconURL: interaction.user.avatarURL({ format: 'png', dynamic: true, size: 1024 }) })



            const allCategories = [
                ...readdirSync("./src/commands/Prefix"),
                ...readdirSync("./src/commands/Slash")
            ].filter(category => category !== "Private");

            allCategories.forEach(category => {
                const prefixCommands = bot.commands.filter(c => c.config.category === category && c.config.type === "prefix");
                const slashCommands = bot.slash_commands.filter(c => c.config.category === category && c.config.type === "slash");
                const capitalise = category.slice(0, 1).toUpperCase() + category.slice(1);
                try {
                    embed.addFields({
                        name: `${capitalise} [${prefixCommands.size + slashCommands.size}]:`,
                        value: `${prefixCommands.map(c => `\`${c.config.name}\``).join(" ")} ${slashCommands.map(c => `\`${c.config.name}\``).join(" ")}`
                    });
                } catch (error) {
                    console.error(error);
                    return interaction.reply(error.message);
                }
            });

            embed.addFields({ name: `🔗 More Info About The Bot`, value: `[support server](${bot.discord.supportServer}) | [community](${bot.discord.discordServer})` })


            return await interaction.reply({ embeds: [embed], components: [row] })

        } else {

            try {

                const slashCommand = bot.slash_commands.get(commandName.toLowerCase());
                if (slashCommand) {
                    embed.setDescription(`The bot prefix is \`${primaryPrefix}\`
                
                    **❯ Command:** \`${slashCommand.config.name.slice(0, 1).toUpperCase() + slashCommand.config.name.slice(1)}\`
                    **❯ Usage:** \`/${slashCommand.config.usage}\`
                    **❯ Aliases:** \`${slashCommand.config.aliases ? slashCommand.config.aliases.join(", ") : 'None'}\`
                    **❯ Cooldown:** \`${slashCommand.config.cooldown || '3'} seconds.\`
                    **❯ Type:** \`${slashCommand.config.type}\`

                    **❯ Description:** ${slashCommand.config.description || 'No description provided.'}`)
                    return await interaction.reply({ embeds: [embed], ephemeral: true })

                } else {
                    let command = bot.commands.get(bot.aliases.get(commandName.toLowerCase()) || commandName.toLowerCase())
                    if (!command) {
                        embed.setTitle('Invalid command:')
                        embed.setDescription(`Do \`/help\` for the list of the commands!`)
                        return await interaction.reply({ embeds: [embed], ephemeral: true })
                    }

                    command = command.config
                    embed.setDescription(`The bot prefix is \`${primaryPrefix}\`
                
                    **❯ Command:** \`${command.name.slice(0, 1).toUpperCase() + command.name.slice(1)}\`
                    **❯ Usage:** \`${primaryPrefix}${command.usage}\`
                    **❯ Aliases:** \`${command.aliases ? command.aliases.join(", ") : 'None'}\`
                    **❯ Cooldown:** \`${command.cooldown || '3'} seconds.\`
                    **❯ Type:** \`${command.type}\`

                    **❯ Description:** ${command.description || 'No description provided.'}`)
                    return await interaction.reply({ embeds: [embed], ephemeral: true })
                }

            } catch (error) {
                commandErrors('Command Error', error.message, error.stack, interaction.guild.id, interaction.guild.name, 'help');
            }
        }
    }
};