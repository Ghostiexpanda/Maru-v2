const { RockPaperScissors } = require('discord-gamecord');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  config: {
    name: "rps",
    category: "Fun",
    description: `Play Rps`,
    usage: "rps <opponent>",
    type: "slash", // or "slash"
    cooldown: 5
},
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Play a game of rock paper scissors!')
        .addUserOption(option => option.setName('opponent').setDescription('The user you want to play against.').setRequired(true)),

    async execute(interaction) {

        const Game = new RockPaperScissors({
            message: interaction,
            isSlashGame: false,
            opponent: interaction.options.getUser('opponent'),
            embed: {
              title: 'Rock Paper Scissors',
              color: '#5865F2',
              description: 'Press a button below to make a choice.'
            },
            buttons: {
              rock: 'Rock',
              paper: 'Paper',
              scissors: 'Scissors'
            },
            emojis: {
              rock: '🌑',
              paper: '📰',
              scissors: '✂️'
            },
            mentionUser: true,
            timeoutTime: 60000,
            buttonStyle: 'PRIMARY',
            pickMessage: 'You choose {emoji}.',
            winMessage: '**{player}** won the Game! Congratulations!',
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