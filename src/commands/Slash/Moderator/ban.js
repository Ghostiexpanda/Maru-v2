const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionsBitField} = require("discord.js");

const { commandErrors } = require('../../../assets/handler/handleWebhook');

module.exports = {
  config: {
    name: "ban",
    category: "Moderator",
    description: `Bans a user.`,
    usage: "ban <user> (reason)",
    type: "slash", // or "slash"
    cooldown: 5,
  },
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bans a user from the server.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user to ban.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("The reason for the ban.")
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      const user = interaction.options.getUser("user");
      const reason = interaction.options.getString("reason");
      const member = interaction.guild.members.cache.get(interaction.user.id);

      if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return interaction.reply({
          content:
            "You do not have permission **BAN_MEMBERS** to use this command",
          ephemeral: true,
        });
      }

      if (user.id === interaction.user.id) {
        return interaction.reply({
          content:
            "You cannot ban yourself.",
          ephemeral: true,
        });
      }

     

     
      const banEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle(`${user.tag} has been banned.`)
        .addFields(
          { name: "User", value: `${user.tag} (${user.id})` },
          {
            name: "Moderator",
            value: `${member.user.tag} (${member.user.id})`,
          },
          { name: "Reason", value: reason }
        );

      await interaction.guild.members.ban(user, { reason });

      await interaction.reply({ embeds: [banEmbed] });
    } catch (error) {
      commandErrors(
        "Command Error",
        error.message,
        error.stack,
        interaction.guild.id,
        interaction.guild.name,
        "ban"
      );
    }
  },
};
