const { webHooks } = require("../../../config/cfg")
const axios = require('axios')
const webhookUrl = webHooks.errorWebhookUrl
async function botErrors(errorTitle, errorMessage, stackTrace) {
    try {
        const response = await axios.post(webhookUrl, {
            embeds: [
                {
                    title: errorTitle,
                    fields: [
                        {
                            name: `❯ Error Message:`,
                            value: `\`\`\`${errorMessage}\`\`\``,
                        },
                        {
                            name: `❯ Error Stack:`,
                            value: `\`\`\`${stackTrace}\`\`\``,
                        }
                    ],
                    color: 0xff0000
                }
            ]
        });

        console.log(`Webhook message sent. Status code: ${response.status}`);
    } catch (error) {
        console.error('Error sending webhook message:', error.message)
    }
}

async function commandErrors(errorTitle, errorMessage, stackTrace, guildId, guildName, commandName) {
    try {
        const response = await axios.post(webhookUrl, {
            embeds: [
                {
                    title: errorTitle,
                    description: `Error spotted for the command **${commandName}**`,
                    fields: [
                        {
                            name: `❯ Guild Name:`,
                            value: `\`\`\`${guildName}\`\`\``,
                        },
                        {
                            name: `❯ Guild ID:`,
                            value: `\`\`\`${guildId}\`\`\``,
                        },
                        {
                            name: `❯ Error Message:`,
                            value: `\`\`\`${errorMessage}\`\`\``,
                        },
                        {
                            name: `❯ Error Stack:`,
                            value: `\`\`\`${stackTrace}\`\`\``,
                        }
                    ],
                    color: 0xff0000
                }
            ]
        });

        console.log(`Webhook message sent. Status code: ${response.status}`);
    } catch (error) {
        console.error('Error sending webhook message:', error.message)
    }
}

module.exports = {
    botErrors,
    commandErrors
}