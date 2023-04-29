const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, Embed } = require('discord.js');
const fetch = require("node-fetch")

module.exports = {
    config: {
        name: "memes",
        category: "Community",
        description: `Get a random meme, for free! What more to ask..`,
        usage: "memes",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
    .setName('memes')
    .setDescription('Get a random meme, for free! What more to ask..'),
    async execute(interaction) {

        async function meme() {
            await fetch(`https://www.reddit.com/r/memes/random.json`)
            .then (async r => {

                let meme = await r.json();
                let title = meme[0].data.children[0].data.title;
                let image = meme[0].data.children[0].data.url;
                let author = meme[0].data.children[0].data.author;

                const embed = new EmbedBuilder()
                .setColor("DarkBlue")
                .setTitle(`> Random meme Generated!`)
                .addFields({ name: '• Your Legendary Meme', value: `> ${title}`})
                .setImage(`${image}`)
                .setAuthor({ name: `😂 Random Meme Tool`})
                .setFooter({ text: `😂 Memes Playground`})
                .setTimestamp()
                .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')

                await interaction.reply({ embeds: [embed]})

            })
        }
        
        meme();
    }
}