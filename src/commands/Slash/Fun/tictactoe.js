const { TicTacToe } = require('discord-gamecord');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  config: {
    name: "tictactoe",
    category: "Fun",
    description: "Play a game of TicTacToe with someone",
    usage: "tictactoe <opponent>",
    type: "slash", // or "slash"
    cooldown: 1
},
    data: new SlashCommandBuilder()
        .setName('tictactoe')
        .setDescription('Play a game of tic tac toe!')
        .addUserOption(option => option.setName('opponent').setDescription('The user you want to play against.').setRequired(true)),

    async execute(interaction) {
        const Game = new TicTacToe({
            message: interaction,
            isSlashGame: true,
            opponent: interaction.options.getUser('opponent'),
            embed: {
              title: 'Tic Tac Toe',
              color: '#5865F2',
              statusTitle: 'Status',
              overTitle: 'Game Over'
            },
            emojis: {
              xButton: '❎',
              oButton: '🅾️',
              blankButton: '➖'
            },
            mentionUser: true,
            timeoutTime: 60000,
            xButtonStyle: 'PRIMARY',
            oButtonStyle: 'PRIMARY',
            turnMessage: '{emoji} | Its turn of player **{player}**.',
            winMessage: '{emoji} | **{player}** won the TicTacToe Game.',
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