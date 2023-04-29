const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, PermissionsBitField } = require('discord.js');
const { ComponentType } = require('discord.js');

const bansPerPage = 5;

module.exports = {
    config: {
        name: "bans",
        category: "Moderator",
        description: `Check the bans in current server.`,
        usage: "bans",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('bans')
        .setDescription('Displays the banned users in the current guild'),
        async execute(interaction) {
            

          if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
        }
          const bans = await interaction.guild.bans.fetch();
          if (bans.size === 0) {
            return interaction.reply({ content: 'There are no banned users in this server.', ephemeral: true });
        }

        
          const totalPages = Math.ceil(bans.size / bansPerPage);
          let currentPage = 1;
        
          const embed = new EmbedBuilder()
            .setTitle(`Banned users in ${interaction.guild.name}`)
            .setDescription(getBansDescription(bans, currentPage))
            .setColor("Red");
        
          const row = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId("previous")
                .setLabel("Previous")
                .setStyle("Secondary")
                .setDisabled(currentPage === 1),
              new ButtonBuilder()
                .setCustomId("next")
                .setLabel("Next")
                .setStyle("Primary")
                .setDisabled(currentPage === totalPages)
            );
        
          await interaction.reply({ embeds: [embed], components: [row] });
          const message = await interaction.fetchReply();
          const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 })
        
          collector.on("collect", async (i) => {
            if (i.customId === "previous") {
              currentPage--;
            } else if (i.customId === "next") {
              currentPage++;
            }
        
            const bansDescription = getBansDescription(bans, currentPage);
            embed.setDescription(bansDescription);
        
            row.components[0].setDisabled(currentPage === 1);
            row.components[1].setDisabled(currentPage === totalPages);
        
            await i.update({ embeds: [embed], components: [row] });
          });
        }
 
    }
  

function getBansDescription(bans, page) {
  const startIndex = (page - 1) * bansPerPage;
  const endIndex = startIndex + bansPerPage;
  const bansArray = Array.from(bans.values());
 const bansSlice = bansArray.slice(startIndex, endIndex);

  const banDescriptions = bansSlice.map((ban) => {
    const user = ban.user;
    return `User: ${user.tag} User ID: (${user.id}): Reason: ${ban.reason || "No reason provided"}`;
  });

  return banDescriptions.join("\n");
}

