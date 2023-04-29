const { spawn } = require('child_process');
const { commandErrors } = require('../../../assets/handler/handleWebhook');
module.exports = {
    config: {
        name: 'restartbot',
        cooldown: 1,
        category: 'Private',
        type: "prefix"
    },
    requirements: {
        clientPerms: ["SendMessages"],
        userPerms: ["SendMessages"],
        ownerOnly: true
    },
    status: {
        underConstructions: false
    },
    run: async (bot, message, args) => {
        try {
            message.channel.send('Restarting the bot...');

            // Spawn a new process to run the bot again in a new command prompt window
            const subprocess = spawn('start', ['cmd.exe', '/c', 'node --no-warnings app.js'], {
                shell: true
            });

            // Wait for 5 seconds to let the new process start
            setTimeout(() => {
                // Exit the current process
                process.exit();
            }, 5000);
        } catch (error) {
            commandErrors('Command Error', error.message, error.stack, message.guild.id, message.guild.name, 'restartbot');
        }

    },
};