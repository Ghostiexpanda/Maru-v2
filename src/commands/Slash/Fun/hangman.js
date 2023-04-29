const { SlashCommandBuilder } = require('@discordjs/builders');
const { Hangman } = require('discord-gamecord');

module.exports = {
    config: {
        name: "hangman",
        category: "Fun",
        description: "play a game of hangman",
        usage: "hangman",
        type: "slash", // or "slash"
        cooldown: 1
    },
    data: new SlashCommandBuilder()
        .setName('hangman')
        .setDescription('Play a game of hangman!'),
    async execute(interaction) {
        const Game = new Hangman({
            message: interaction,
            embed: {
                title: 'Hangman || category: nature',
                color: '#5865F2'
            },

            hangman: {hat: '🎩', head: '😟', shirt: '👕', pants: '👖', boots: '👟👟'},
            timeoutTime: 60000,
            themewords: "nature",
            word: 'random',
            winMessage: 'You won! The word was **{word}**',
            loseMessage: 'You lost! The word was **{word}**',
            playerOnlyMessage: 'Only {player}  can use the buttons!',
        })

        Game.startGame();
        Game.on('gameOver', result => {
            return;
        })
    }
}

