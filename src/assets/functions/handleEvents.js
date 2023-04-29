const fs = require("fs")
const path = require("node:path");

module.exports = (bot) => {
    
    bot.handleEvents = async () => {
        const botEventsPath = path.join(__dirname, "../events/client");
        const botEventFiles = fs.readdirSync(botEventsPath).filter((file) => file.endsWith(".js"));

        for (const file of botEventFiles) {
            
            const filePath = path.join(botEventsPath, file);
            const event = require(filePath);
            if (event.once) {
                bot.once(event.name, (...args) => event.execute(...args, bot));
            } else {
                bot.on(event.name, (...args) => event.execute(...args, bot));
            }
            
        }
        const events = fs.readdirSync(`./src/assets/events/server/`).filter(d => d.endsWith('.js'));

        for (const file of events) {
            const evt = require(`../events/server/${file}`);
            console.log(`Loading discord.js event ${file}`.green)
            const eName = file.split('.')[0];
            bot.on(eName, evt.bind(null, bot));
        };
    };
};