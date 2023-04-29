const { SlashCommandBuilder } = require('@discordjs/builders');
const { Slots } = require('discord-gamecord');
const ecoSchema = require('../../../schemas/ecoSchema');

module.exports = {
  config: {
    name: "slots",
    category: "Economy",
    description: `Bet on slots`,
    usage: "slots <betamount>",
    type: "slash", // or "slash"
    cooldown: 5
},
  data: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('Play the slots game and win money!')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('The amount of money you want to bet')
        .setRequired(true)
    ),
  async execute(interaction) {
    
      const betAmount = interaction.options.getInteger('bet');

      if (betAmount <= 0) {
        return interaction.reply('Your bet amount must be greater than 0!');
      }

      const guildID = interaction.guild.id;
      const userID = interaction.user.id;

      let userEco = await ecoSchema.findOne({ Guild: guildID, User: userID });
      if (!userEco) {
        userEco = await ecoSchema.create({ Guild: guildID, User: userID });
      }

      if (userEco.Wallet < betAmount) {
        return interaction.reply("You don't have enough money to place that bet!");
      }

      const Game = new Slots({
        message: interaction,
        isSlashGame: true,
        embed: {
          title: 'Slot Machine',
          color: '#5865F2'
        },
        slots: ['🍇',  '🍓', '🍒'],
        winPercentage: 99,
      });

      Game.startGame();

      Game.on('gameOver',  async (result) => {
          if (result.result === 'win') {
            userEco.Wallet += betAmount;
            await userEco.save();
          } else  {
            userEco.Wallet -= betAmount;
            await userEco.save();

          } 
      });

  }
};