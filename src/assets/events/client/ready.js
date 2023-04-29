const mongoose = require('mongoose');
const mongodbURl = `mongodb+srv://trexmex3223:Lovethan11@cluster0.axwtzcb.mongodb.net/Maru`


module.exports = {
    name: "ready",
    once: true,
    async execute(bot) {
        console.log(`Logged in as ${bot.user.username}. Ready on ${bot.guilds.cache.size} servers, for total of ${bot.users.cache.size} users!`)


        
        if (!mongodbURl) return console.error('No MongoDB URL provided!');

        await mongoose.connect(mongodbURl || '', {
            keepAlive: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })

        if (mongoose.connect) {
            console.log('Connected to MongoDB!')
        }
    }
};