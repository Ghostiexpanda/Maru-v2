const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const voteSchema = require('../../../schemas/voteSchema');

module.exports = {
  config: {
    name: "vote",
    category: "misc",
    description: `vote for the bot`,
    usage: "vote",
    type: "slash", // or "slash"
    cooldown: 5
},
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Vote for the bot on DiscordBotList.com and top.gg'),
        async execute(interaction) {
            const userId = interaction.user.id;
            let userVote = await voteSchema.findOne({ userId });
          
            const discordBotListUrl = `https://discordbotlist.com/bots/1082544311431860254/upvote`;
            const topGgUrl = `https://top.gg/bot/1082544311431860254/vote`;
            const embed = new EmbedBuilder()
              .setTitle('Vote for the bot')
              .setDescription('You can vote for the bot on the following websites:')
              .setColor('Blue');
            const row = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setURL(discordBotListUrl)
                  .setLabel('Vote on DiscordBotList.com')
                  .setStyle('Link'),
                new ButtonBuilder()
                  .setURL(topGgUrl)
                  .setLabel('Vote on top.gg')
                  .setStyle('Link'),
              );
          
            const twelveHoursInMillis = 12 * 60 * 60 * 1000;
          
            if (!userVote || userVote.lastVoted < Date.now() - twelveHoursInMillis) {
              // User has not voted recently, send reminder message to their DMs
              await interaction.reply({ embeds: [embed], components: [row] });
              await interaction.user.send('Reminder: please vote for the bot on DiscordBotList.com and top.gg!');
          
              // Update lastVoted field in the voteSchema
              if (!userVote) {
                // If the user hasn't voted before, create a new vote document in the voteSchema
                userVote = new voteSchema({
                  userId: userId,
                  lastVoted: Date.now()
                });
              } else {
                // Update the lastVoted field in the existing vote document
                userVote.lastVoted = Date.now();
              }
              await userVote.save();
          
              // Schedule a job to send a reminder message after 12 hours
              setTimeout(async () => {
                await interaction.user.send('Reminder: please vote for the bot on DiscordBotList.com and top.gg!');
              }, twelveHoursInMillis);
            } else {
              // User has already voted recently, send message indicating when they can vote again
              const nextVoteTime = new Date(userVote.lastVoted + twelveHoursInMillis);
              await interaction.reply(`You have already voted recently. You can vote again on ${nextVoteTime.toDateString()}.`);
            }
          }
        }          