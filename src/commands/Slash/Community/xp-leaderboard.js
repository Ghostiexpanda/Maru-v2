const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, DiscordAPIError } = require('discord.js');
const levelSchema = require(`../../../schemas/level`)
 
module.exports = {
    config: {
        name: "xp-leaderboard",
        category: "Community",
        description: `Shows the xp leaderboard`,
        usage: "xp-leaderboard",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
    .setName('xp-leaderboard')
    .setDescription('This gets a servers xp leaderboard'),
    async execute(interaction) {
 
        const { guild, client } = interaction;
 
        let text = "";
 
        const embed1 = new EmbedBuilder()
        .setColor("Blue")
        .setDescription(`:redcheck:  No one is on the leaderboard yet...`)
 
        const Data = await levelSchema.find({ Guild: guild.id})
            .sort({ 
                
                Level: -1,
                XP: -1
            })
            .limit(10)
 
            if (!Data) return await interaction.reply({ embeds: [embed1]});
 





            await interaction.deferReply()
 
            for(let counter = 0; counter < Data.length; ++counter) {
                let { User, XP, Level } = Data[counter]
 
                    const value = await client.users.fetch(User) || "Unknown Member"
 
                    const member = value.tag;
 
                    text += `${counter + 1}. ${member} | Level: ${Level} | XP: ${XP} \n`
 
                    const embed = new EmbedBuilder()
                        .setColor("Blue")
                        .setTitle(`${interaction.guild.name}'s XP Leaderboard:`)
                        .setDescription(`\`\`\`${text}\`\`\``)
                        .setTimestamp()
                        .setFooter({ text: `Requested by ${interaction.user.tag}`})
 
                   interaction.editReply({ embeds: [embed] })
 
            } 
 
    }
}
 