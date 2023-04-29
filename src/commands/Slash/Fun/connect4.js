const { Connect4 } = require('discord-gamecord');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  config: {
    name: "connect4",
    category: "Fun",
    description: "Play a game of connect4 with someone",
    usage: "connect4 <opponent>",
    type: "slash", // or "slash"
    cooldown: 1
},
    data: new SlashCommandBuilder()
        .setName('connect4')
        .setDescription('Play a game of connect 4!')
        .addUserOption(option => option.setName('opponent').setDescription('The user you want to play against.').setRequired(true)),

    async execute(interaction) {

        const Game = new Connect4({
            message: interaction,
            isSlashGame: false,
            opponent: interaction.options.getUser('opponent'),
            embed: {
              title: 'Connect4 Game',
              statusTitle: 'Status',
              color: '#5865F2'
            },
            emojis: {
              board: '⚪',
              player1: '🔴',
              player2: '🟡'
            },
            mentionUser: true,
            timeoutTime: 60000,
            buttonStyle: 'PRIMARY',
            turnMessage: '{emoji} | Its turn of player **{player}**.',
            winMessage: '{emoji} | **{player}** won the Connect4 Game.',
            tieMessage: 'The Game tied! No one won the Game!',
            timeoutMessage: 'The Game went unfinished! No one won the Game!',
            playerOnlyMessage: 'Only {player} and {opponent} can use these buttons.'
          });
          
          Game.startGame();
          Game.on('gameOver', result => {
            return;  
          });
    }
}