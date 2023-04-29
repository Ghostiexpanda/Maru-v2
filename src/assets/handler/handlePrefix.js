const { readdirSync } = require("fs")
module.exports = async (bot) => {
    console.log("[i] Prefix Command Handler:".blue);

    const load = dirs => {
        const commands = readdirSync(`./src/commands/Prefix/${dirs}/`).filter(d => d.endsWith('.js'));
        for (const file of commands) {
            const pull = require(`../../commands/Prefix/${dirs}/${file}`);
            console.log(`Loading prefix command ${file}`.green)
            bot.commands.set(pull.config.name, pull);
            if (pull.config.aliases) pull.config.aliases.forEach(a => bot.aliases.set(a, pull.config.name));
        };
    };
    ["Private"].forEach(x => load(x));

};