const { Minesweeper } = require('discord-gamecord');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  config: {
    name: "minesweeper",
    category: "Fun",
    description: "Play a game of minesweeper",
    usage: "minesweeper",
    type: "slash", // or "slash"
    cooldown: 1
},
    data: new SlashCommandBuilder()
        .setName('minesweeper')
        .setDescription('Play a game of minesweeper!'),

    async execute(interaction) {

        const Game = new Minesweeper({
            message: interaction,
            isSlashGame: true,
            embed: {
              title: 'Minesweeper',
              color: '#5865F2',
              description: 'Click on the buttons to reveal the blocks except mines.'
            },
            emojis: { flag: '🚩', mine: '💣' },
            mines: 5,
            timeoutTime: 60000,
            winMessage: 'You won the Game! You successfully avoided all the mines.',
            loseMessage: 'You lost the Game! Beaware of the mines next time.',
            playerOnlyMessage: 'Only {player} can use these buttons.'
          });
          
          Game.startGame();
          Game.on('gameOver', result => {
            return;
          });
          
    }
}