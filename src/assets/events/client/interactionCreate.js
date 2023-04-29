const { commandErrors } = require("../../handler/handleWebhook")

const { EmbedBuilder, Collection } = require("discord.js");

const fs = require("fs")

const { readdirSync } = require("fs")
const { logSlashCommand } = require("../logs/logger");

const cooldowns = new Collection()

module.exports = {
    name: "interactionCreate",
    once: false,
    async execute(interaction, bot) {

        if (interaction.isChatInputCommand()) {
            const command = bot.slash_commands.get(interaction.commandName);
            if (!command) return;


            const userId = interaction.user.id
            if (!cooldowns.has(command.config.cooldown)) {
                cooldowns.set(command.config.cooldown, new Collection())
            }
            const now = Date.now()
            const timestamps = cooldowns.get(command.config.cooldown);
            let cooldownAmount = (command.config.cooldown || 3) * 1000;

            const OwnerID = bot.discord.OwnerID

            if (timestamps.has(userId)) {
                if (userId === OwnerID) {
                    cooldownAmount === 0
                } else {
                    const expirationTime = timestamps.get(userId) + cooldownAmount;
                    if (now < expirationTime) {
                        const timeLeft = (expirationTime - now) / 1000;
                        return interaction.reply({ content: `Please wait **${timeLeft.toFixed(1)}** second(s) before reusing \`/${interaction.commandName}\``, ephemeral: true });
                    };
                };
            };

            timestamps.set(userId, now);
            setTimeout(() => {
                timestamps.delete(userId)
            }, cooldownAmount);

            if (command.status && command.status.underConstructions === true && interaction.user.id !== OwnerID) {
                const embed = new EmbedBuilder()
                    .setColor(bot.colors.yellow)
                    .setAuthor({ name: bot.discord.botusername, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })
                    .setTitle(`The command ${command.config.name} is under constructions:`)
                    .setDescription(`[${bot.emotes.botInfo}](${bot.discord.supportServer}) Looks like there are some issues with the command you tried to use, and it's currently under construction.\n\n<:dot:1081566061113114634> We apologize for any inconvenience this may have caused.\n<:dot:1081566061113114634> Our team is working hard to resolve the issue, and we appreciate your patience while we work on improving this command.\n\nFor more information join our [support server](${bot.discord.supportServer}) or use \`/bug\` to report a bug.`)
                return interaction.reply({ embeds: [embed], ephemeral: true })
            }

            try {

                await command.execute(interaction, bot);
                logSlashCommand(bot, interaction, interaction.commandName)

            } catch (error) {
                //console.error(error)
                const errorMessage = error.message || 'Unknown error occurred.';
                const stackTrace = error.stack || 'No stack trace available.';
                commandErrors('Command Error', errorMessage, stackTrace, interaction.guild.id, interaction.guild.name, interaction.commandName);
            }

        } else if (interaction.isButton()) {
            if (interaction.customId.includes("-")) {
                const dashIndex = interaction.customId.indexOf("-");
                const buttonOwner = interaction.customId.substring(interaction.customId.length - 18, interaction.customId.length);
                const embed = new EmbedBuilder();
                embed.setColor(bot.colors.red);
                if (interaction.user.id != buttonOwner) {
                    embed.setDescription(`Only <@${buttonOwner}> can use this button.`);
                    return await interaction.reply({
                        embeds: [embed],
                        ephemeral: true,
                    });
                }
                const button = bot.buttons.get(interaction.customId.substring(0, dashIndex));
                if (!button) return;
                try {
                    await button.execute(interaction, bot);
                } catch (error) {
                    console.error(error);
                }
            } else {
                const button = bot.buttons.get(interaction.customId);
                if (!button) return;
                try {
                    await button.execute(interaction, bot);
                } catch (error) {
                    console.error(error);
                }
            }

        } else if (interaction.isStringSelectMenu()) {

            const buttonOwner = interaction.customId.substring(interaction.customId.length - 18, interaction.customId.length);

            const embed = new EmbedBuilder();
            embed.setColor(bot.colors.embedColor);
            if (interaction.user.id != buttonOwner) {
                embed.setColor(bot.colors.red)
                embed.setDescription(`Only <@${buttonOwner}> can use this menu.`);
                return await interaction.reply({
                    embeds: [embed],
                    ephemeral: true,
                });
            }

            if (interaction.customId === `command-selection_${interaction.user.id}`) {
                embed.setAuthor({ name: `${interaction.guild.members.me.displayName} Help`, iconURL: interaction.guild.iconURL({ format: 'png', dynamic: true, size: 1024 }) })
                embed.setThumbnail(bot.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))

                const primaryPrefix = bot.discord.primaryPrefix
                const secondaryPrefix = bot.discord.secondaryPrefix

                const selectedValue = interaction.values[0]

                if (selectedValue === "commandlist") {

                    var date = new Date();
                    date = date.toLocaleString();


                    embed.setDescription(`These are the available commands for ${bot.discord.botusername}\nThe bot prefix is \`${primaryPrefix}\` or \`${secondaryPrefix}\`\n\nFor arguements in commands: \n\`[]\` means it's required\n\`()\` means it's opitional\nDo not actually include the \`[]\` & \`()\` symbols in the command\n\nWe are not using slash commands to avoid the limit but you can always use \`/bug\` to report a bug.`)
                    embed.setFooter({ text: `Total Command: ${bot.commands.size} | Requested at: ${date}`, iconURL: interaction.user.avatarURL({ format: 'png', dynamic: true, size: 1024 }) })

                    const allCategories = [
                        ...readdirSync("./commands/Prefix"),
                        ...readdirSync("./commands/Slash")
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

                }

                return await interaction.update({ embeds: [embed] });
            }
        }
    },
};


