const { EmbedBuilder, Collection, PermissionsBitField } = require("discord.js")

const { logCommand } = require("../logs/logger");
const { commandErrors } = require("../../handler/handleWebhook");

const cooldowns = new Collection();

module.exports = async (bot, message) => {

    if (message.author.bot || message.channel.type === 'dm') return;

    const authorID = message.author.id

    const prefix = bot.discord.primaryPrefix

    let sliceamount = prefix
    let secPrefix = bot.discord.secondaryPrefix

    if (message.content.substring(0, secPrefix.length) == secPrefix) sliceamount = secPrefix
    const args = message.content
        .slice(sliceamount.length)
        .trim()
        .split(/ +/g);

    const cmd = args.shift().toLowerCase();

    if (message.content.substring(0, sliceamount.length) == sliceamount) {
        const { guild } = message;
        let OwnerID = bot.discord.OwnerID

        let commandFile = bot.commands.get(cmd) || bot.commands.get(bot.aliases.get(cmd))
        if (!commandFile) return;

        if (!cooldowns.has(commandFile.config.cooldown)) {
            cooldowns.set(commandFile.config.cooldown, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(commandFile.config.cooldown);
        let cooldownAmount = (commandFile.config.cooldown || 3) * 1000;
        if (timestamps.has(authorID)) {
            if (authorID === OwnerID) {
                cooldownAmount === 0
            } else {
                const expirationTime = timestamps.get(authorID) + cooldownAmount;
                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    return message.reply(`Please wait **${timeLeft.toFixed(1)}** second(s) before reusing the **${commandFile.config.name}** command.`);
                };
            };
        };

        timestamps.set(authorID, now);
        setTimeout(() => {
            timestamps.delete(authorID)
        }, cooldownAmount);

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages)) return;

        const clientPermissions = commandFile.requirements.clientPerms
        const userPermissions = commandFile.requirements.userPerms

        if (commandFile.requirements.ownerOnly && message.author.id !== OwnerID) {
            const embed = new EmbedBuilder()
                .setColor(bot.colors.red)
                .setDescription(`The command **${commandFile.config.name}**` + ` is owner only command.`)
            return message.channel.send({ embeds: [embed] })
        }

        if (commandFile.status && commandFile.status.underConstructions === true && message.author.id !== OwnerID) {
            const embed = new EmbedBuilder()
                .setColor(bot.colors.yellow)
                .setAuthor({ name: bot.discord.botusername, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })
                .setTitle(`The command ${commandFile.config.name} is under constructions:`)
                .setDescription(`Looks like there are some issues with the command you tried to use, and it's currently under construction.\n\n<:dot:1081566061113114634> We apologize for any inconvenience this may have caused.\n<:dot:1081566061113114634> Our team is working hard to resolve the issue, and we appreciate your patience while we work on improving this command.\n\nFor more information join our [support server](${bot.discord.supportServer}) or use \`/bug\` to report a bug.`)
            return message.channel.send({ embeds: [embed] })
        }

        if (commandFile) {
            if (!message.member.permissions.has(PermissionsBitField.resolve(userPermissions || []))) {
                const embed = new EmbedBuilder()
                    .setColor(bot.colors.red)
                    .setDescription(`Missing permissions \`${missingPerms(message.member, userPermissions)}\``)
                return message.channel.send({ embeds: [embed] })
            }

            if (!guild.members.me.permissions.has(PermissionsBitField.resolve(clientPermissions || []))) {
                const embed = new EmbedBuilder()
                    .setColor(bot.colors.red)
                    .setDescription(`Missing permissions \`${missingPerms(message.member, userPermissions)}\``)
                return message.channel.send({ embeds: [embed] })
            }

            try {
                commandFile.run(bot, message, args)
                logCommand(bot, message, commandFile.config.name)
            } catch (error) {

                const errorMessage = error.message || 'Unknown error occurred.';
                const stackTrace = error.stack || 'No stack trace available.';
                commandErrors('Command Error', errorMessage, stackTrace, message.guild.id, message.guild.name, commandName);
            }
        }

    } else {
        return;
    }
};

const missingPerms = (member, perms) => {
    const missingPerms = member.permissions.missing(PermissionsBitField.resolve(perms || []))
        .map(str => `\`${str.replace(/_/g, ' ').toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase())}\``);

    return missingPerms.length > 1 ? `${missingPerms.slice(0, -1).join(", ")} and ${missingPerms.slice(-1)[0]}` : missingPerms[0];
}