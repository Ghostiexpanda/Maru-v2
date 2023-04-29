const fs = require("node:fs");
const path = require("node:path");

module.exports = (bot) => {
    bot.handleButtons = async () => {
        const buttonFolders = fs
            .readdirSync("src/buttons", { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

        for (const folder of buttonFolders) {
            const folderPath = path.join("src/buttons", folder);
            const buttonFiles = fs
                .readdirSync(folderPath)
                .filter((file) => file.endsWith(".js"));

            for (const file of buttonFiles) {
                const button = require(`../../buttons/${folder}/${file}`);
                bot.buttons.set(button.name, button);
            }
        }
    };
};
