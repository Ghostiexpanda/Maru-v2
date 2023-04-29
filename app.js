const { Client, Collection, AuditLogEvent, GatewayIntentBits, Partials, ModalBuilder, TextInputBuilder, ButtonBuilder, EmbedBuilder, Events, ActionRowBuilder, TextInputStyle, AttachmentBuilder, ButtonStyle  } = require("discord.js");
const fs = require("node:fs");
const yaml = require("js-yaml");
const colors = require("colors");
const { Player } = require("discord-player");
const GiveawaysManager = require("./src/assets/utils/gw");
const { CaptchaGenerator } = require('captcha-canvas')


if (!fs.existsSync("config.yml")) {
  return console.error("[Aborted] Unable to find config.yml file. Please copy the default configuration into a file named config.yml in the root directory. (The same directory as package.json)");
}

if (!fs.existsSync("src/data.json")) {
  fs.writeFileSync("src/data.json", JSON.stringify({ "songs-played": 0, "queues-shuffled": 0, "songs-skipped": 0 }));
}

const configFile = yaml.load(fs.readFileSync("config.yml"));

global.config = {
  token: configFile.botToken ?? "",
  botId: configFile.clientId ?? "",
  geniusKey: configFile.geniusApiKey ?? null,
  embedColour: configFile.embedColour ?? "#2F3136",
  analytics: configFile.enableAnalytics ?? true,
  stopEmoji: configFile.emojistop ?? "⏹",
  skipEmoji: configFile.emojiskip ?? "⏭",
  queueEmoji: configFile.emojiqueue ?? "📜",
  pauseEmoji: configFile.emojipause ?? "⏯",
  lyricsEmoji: configFile.emojilyrics ?? "📜",
  backEmoji: configFile.emojiback ?? "⏮",
};

if (!global.config.token || global.config.token === "") return console.error("[Aborted] Please supply a bot token in your configuration file.".red);
if (!global.config.botId || global.config.botId === "") return console.error("[Aborted] Please supply a client ID in your configuration file.".red);
if (global.config.geniusKey === "") global.config.geniusKey = null;

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    Object.keys(GatewayIntentBits)
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction
  ],
  presence: {
    activities: [{
      name: `/help`,
      type: 0
    }],
    status: 'online'
}
});

bot.giveawayManager = new GiveawaysManager(bot, {
  default: {
    botsCanWin: false,
    embedColor: "#FF0000",
    embedColorEnd: "#000000",
    reaction: "🎉",
  },
});

// Create a new instance of the Player class
bot.player = new Player(bot);


bot.slash_commands = new Collection();
bot.buttons = new Collection();

bot.cfg = require('./config/cfg');
bot.emotes = bot.cfg.emojis;
bot.discord = bot.cfg.discord;
bot.system = bot.cfg.system;
bot.colors = bot.cfg.colors;

const errorHandler = require('./src/assets/handler/handleErrors');
const { botErrors } = require("./src/assets/handler/handleWebhook");

bot.on("disconnect", errorHandler.disconnect)
  .on("reconnecting", errorHandler.reconnecting)
  .on("warn", errorHandler.warn)
  .on("error", errorHandler.error)
  .on("shardError", errorHandler.DiscordAPIError);

// Handle errors:
process.on('unhandledRejection', async (err, promise) => {
  console.error(`[ANTI-CRASH] Unhandled Rejection: ${err}`.red);
  const errorMessage = err.message || 'Unknown error occurred.';
  const stackTrace = err.stack || 'No stack trace available.';
  botErrors('Unhandled Rejection', errorMessage, stackTrace)
});


const functions = fs.readdirSync("./src/assets/functions").filter((file) => file.endsWith(".js"));

['aliases', 'commands'].forEach(x => bot[x] = new Collection());
['handlePrefix'].forEach(x => require(`./src/assets/handler/${x}`)(bot));


(async () => {
  for (var file of functions) {
    require(`./src/assets/functions/${file}`)(bot);
  }
  bot.handleSlahCommands();
  bot.handleEvents();
  bot.handleButtons();
  bot.login(global.config.token);
})();

// Leveling System Code //

const levelSchema = require('./src/schemas/level');
const levelschema = require('./src/schemas/levelsetup');

bot.on(Events.MessageCreate, async (message, err) => {

    const { guild, author } = message;
    if (message.guild === null) return;
    const leveldata = await levelschema.findOne({ Guild: message.guild.id });

    if (!leveldata || leveldata.Disabled === 'disabled') return;
    let multiplier = 1;
    
    multiplier = Math.floor(leveldata.Multi);
    

    if (!guild || author.bot) return;

await levelSchema.findOne({ Guild: guild.id, User: author.id }).then(async (data) => {
    if (!data) {
        await levelSchema.create({
            Guild: guild.id,
            User: author.id,
            XP: 0,
            Level: 0
        });
    }
}).catch(err => {
    console.error(err);
});

    const channel = message.channel;

    const give = 1;

    const data = await levelSchema.findOne({ Guild: guild.id, User: author.id});

    if (!data) return;

    const requiredXP = data.Level * data.Level * 20 + 20;

    if (data.XP + give >= requiredXP) {

        data.XP += give;
        data.Level += 1;
        await data.save();
        
        if (!channel) return;

        const levelembed = new EmbedBuilder()
        .setColor("Purple")
        .setTitle(`> ${author.username} has Leveled Up!`)
        .setFooter({ text: `⬆ ${author.username} Leveled Up`})
        .setTimestamp()
        .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081227919256457246/largepurple.png')
        .addFields({ name: `• New Level Unlocked`, value: `> ${author.username} is now level **${data.Level}**!`})
        .setAuthor({ name: `⬆ Level Playground`})

        await message.channel.send({ embeds: [levelembed] }).catch(err => console.log('Error sending level up message!'));
    } else {

        if(message.member.roles.cache.find(r => r.id === leveldata.Role)) {
            data.XP += give * multiplier;
        } data.XP += give;
        data.save();
    }
})


// AFK System

const afkSchema = require('./src/schemas/afkSchema');
bot.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  const check = await afkSchema.findOne({ Guild: message.guild.id, User: message.author.id });
  if (check) {
    const nick = check.Nickname
    await afkSchema.deleteMany({ Guild: message.guild.id, User: message.author.id });

    await message.member.setNickname(`${nick}`).catch(err => {
      return;
    })

    const m1 = await message.channel.send({ content: `Welcome back, ${message.author}! I have removed your AFK status.`, ephemeral: true });
    setTimeout(() => {
      m1.delete();
    }, 4000)
  } else {
    
    const members = message.mentions.users.first();
    if (!members) return;
    const Data = await afkSchema.findOne({ Guild: message.guild.id, User: members.id});
    if (!Data) return;

    const member = message.guild.members.cache.get(members.id);
    const msg = Data.Message || `No Reason Given`;

    if (message.content.includes(members)) {
      const m = await message.reply ({ content: `${member.user.tag} is currently afk! Leave them alone for god sakes 🙄 - For reason: ${msg}`})
      setTimeout(() => {
        m.delete
        message.delete();
      }, 4000)
    }
  }
})


// Counting System //

bot.on(Events.MessageCreate, async message => {

  const countschema = require('./src/schemas/counting');
  if (message.guild === null) return;
  const countdata = await countschema.findOne({ Guild: message.guild.id });
  let reaction = "";

  if (!countdata) return;

  let countchannel = bot.channels.cache.get(countdata.Channel);

  if (message.author.bot) return;
  if (message.channel.id !== countchannel.id) return;

  if (countdata.Count > 98) {
      reaction = '✔️'
  } else if (countdata.Count > 48) {
      reaction = '☑️'
  } else {
      reaction = '✅'
  }
  
  if (message.author.id === countdata.LastUser) {

      message.reply({ content: `You **cannot** count alone! You **messed up** the counter at **${countdata.Count}**! Back to **0**.`});
      countdata.Count = 0;
      countdata.LastUser = ' ';

      try {
          message.react('❌')
      } catch (err) {
      
      }

  } else {

      if (message.content - 1 < countdata.Count && countdata.Count === 0 && message.author.id !== countdata.LastUser) {

          message.reply({ content: `The **counter** is at **0** by default!`})
          message.react('⚠')
  
      } else if (message.content - 1 < countdata.Count || message.content === countdata.Count || message.content > countdata.Count + 1 && message.author.id !== countdata.LastUser) {
          message.reply({ content: `You **messed up** the counter at **${countdata.Count}**! Back to **0**.`})
          countdata.Count = 0;

          try {
              message.react('❌')
          } catch (err) {
              
          }
  
      } else if (message.content - 1 === countdata.Count && message.author.id !== countdata.LastUser) {
              
          countdata.Count += 1;

          try {
              message.react(`${reaction}`)
          } catch (err) {
              
          }
  
          countdata.LastUser = message.author.id;
      }

  }
  
  countdata.save();
})

//Verification system

const capschema = require('./src/schemas/verify');
const verifyusers = require('./src/schemas/verifyusers');
 
bot.on(Events.InteractionCreate, async interaction => {
 
    if (interaction.guild === null) return;
 
    const verifydata = await capschema.findOne({ Guild: interaction.guild.id });
    const verifyusersdata = await verifyusers.findOne({ Guild: interaction.guild.id, User: interaction.user.id });
 
    if (interaction.customId === 'verify') {
 
        if (!verifydata) return await interaction.reply({ content: `The **verification system** has been disabled in this server!`, ephemeral: true});
 
        if (verifydata.Verified.includes(interaction.user.id)) return await interaction.reply({ content: 'You have **already** been verified!', ephemeral: true})
        else {
 
            let letter = ['0','1','2','3','4','5','6','7','8','9','a','A','b','B','c','C','d','D','e','E','f','F','g','G','h','H','i','I','j','J','f','F','l','L','m','M','n','N','o','O','p','P','q','Q','r','R','s','S','t','T','u','U','v','V','w','W','x','X','y','Y','z','Z',]
            let result = Math.floor(Math.random() * letter.length);
            let result2 = Math.floor(Math.random() * letter.length);
            let result3 = Math.floor(Math.random() * letter.length);
            let result4 = Math.floor(Math.random() * letter.length);
            let result5 = Math.floor(Math.random() * letter.length);
 
            const cap = letter[result] + letter[result2] + letter[result3] + letter[result4] + letter[result5];
            console.log(cap)
 
            const captcha = new CaptchaGenerator()
            .setDimension(150, 450)
            .setCaptcha({ text: `${cap}`, size: 60, color: "red"})
            .setDecoy({ opacity: 0.5 })
            .setTrace({ color: "red" })
 
            const buffer = captcha.generateSync();
 
            const verifyattachment = new AttachmentBuilder(buffer, { name: `captcha.png`});
 
            const verifyembed = new EmbedBuilder()
            .setColor('Green')
            .setAuthor({ name: `✅ Verification Proccess`})
            .setFooter({ text: `✅ Verification Captcha`})
            .setTimestamp()
            .setImage('attachment://captcha.png')
            .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081199958704791552/largegreen.png')
            .setTitle('> Verification Step: Captcha')
            .addFields({ name: `• Verify`, value: '> Please use the button bellow to \n> submit your captcha!'})
 
            const verifybutton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setLabel('✅ Enter Captcha')
                .setStyle(ButtonStyle.Success)
                .setCustomId('captchaenter')
            )
 
            const vermodal = new ModalBuilder()
            .setTitle('Verification')
            .setCustomId('vermodal')
 
            const answer = new TextInputBuilder()
            .setCustomId('answer')
            .setRequired(true)
            .setLabel('• Please sumbit your Captcha code')
            .setPlaceholder('Your captcha code')
            .setStyle(TextInputStyle.Short)
 
            const vermodalrow = new ActionRowBuilder().addComponents(answer);
            vermodal.addComponents(vermodalrow);
 
            const vermsg = await interaction.reply({ embeds: [verifyembed], components: [verifybutton], ephemeral: true, files: [verifyattachment] });
 
            const vercollector = vermsg.createMessageComponentCollector();
 
            vercollector.on('collect', async i => {
 
                if (i.customId === 'captchaenter') {
                    i.showModal(vermodal);
                }
 
            })
 
            if (verifyusersdata) {
 
                await verifyusers.deleteMany({
                    Guild: interaction.guild.id,
                    User: interaction.user.id
                })
 
                await verifyusers.create ({
                    Guild: interaction.guild.id,
                    User: interaction.user.id,
                    Key: cap
                })
 
            } else {
 
                await verifyusers.create ({
                    Guild: interaction.guild.id,
                    User: interaction.user.id,
                    Key: cap
                })
 
            }
        } 
    }
})
 
bot.on(Events.InteractionCreate, async interaction => {
 
    if (!interaction.isModalSubmit()) return;
 
    if (interaction.customId === 'vermodal') {
 
        const userverdata = await verifyusers.findOne({ Guild: interaction.guild.id, User: interaction.user.id });
        const verificationdata = await capschema.findOne({ Guild: interaction.guild.id });
 
        if (verificationdata.Verified.includes(interaction.user.id)) return await interaction.reply({ content: `You have **already** verified within this server!`, ephemeral: true});
 
        const modalanswer = interaction.fields.getTextInputValue('answer');
        if (modalanswer === userverdata.Key) {
 
            const verrole = await interaction.guild.roles.cache.get(verificationdata.Role);
 
            try {
                await interaction.member.roles.add(verrole);
            } catch (err) {
                return await interaction.reply({ content: `There was an **issue** giving you the **<@&${verificationdata.Role}>** role, try again later!`, ephemeral: true})
            }
 
            await interaction.reply({ content: 'You have been **verified!**', ephemeral: true});
            await capschema.updateOne({ Guild: interaction.guild.id }, { $push: { Verified: interaction.user.id }});
 
        } else {
            await interaction.reply({ content: `**Oops!** It looks like you **didn't** enter the valid **captcha code**!`, ephemeral: true})
        }
    }
})

// Leave Message //
const welcomeschema = require('./src/schemas/welcome')
bot.on(Events.GuildMemberRemove, async (member, err) => {

    const leavedata = await welcomeschema.findOne({ Guild: member.guild.id });

    if (!leavedata) return;
    else {

        const channelID = leavedata.Channel;
        const channelwelcome = member.guild.channels.cache.get(channelID);

        const embedleave = new EmbedBuilder()
        .setColor("DarkBlue")
        .setTitle(`${member.user.username} has left`)
        .setDescription( `> ${member} has left the Server`)
        .setFooter({ text: `👋 Cast your goobyes`})
        .setTimestamp()
        .setAuthor({ name: `👋 Member Left`})
        .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081275127850864640/largeblue.png')

        const welmsg = await channelwelcome.send({ embeds: [embedleave]}).catch(err);
        welmsg.react('👋');
    }
})

// Welcome Message //
bot.on(Events.GuildMemberAdd, async (member, err) => {

    const welcomedata = await welcomeschema.findOne({ Guild: member.guild.id });

    if (!welcomedata) return;
    else {

        const channelID = welcomedata.Channel;
        const channelwelcome = member.guild.channels.cache.get(channelID)
        
        const embedwelcome = new EmbedBuilder()
         .setColor("DarkBlue")
         .setTitle(`${member.user.username} has arrived \n to the Server!`)
         .setDescription( `> Welcome ${member} to the Server!`)
         .setFooter({ text: `👋 Get cozy and enjoy :)`})
         .setTimestamp()
         .setAuthor({ name: `👋 Welcome to the Server!`})
         .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081275127850864640/largeblue.png')
    
        const embedwelcomedm = new EmbedBuilder()
         .setColor("DarkBlue")
         .setTitle('Welcome Message')
         .setDescription( `> Welcome to ${member.guild.name}!`)
         .setFooter({ text: `👋 Get cozy and enjoy :)`})
         .setTimestamp()
         .setAuthor({ name: `👋 Welcome to the Server!`})
         .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081275127850864640/largeblue.png')
    
        const levmsg = await channelwelcome.send({ embeds: [embedwelcome]});
        levmsg.react('👋');
        member.send({ embeds: [embedwelcomedm]}).catch(err => console.log(`Welcome DM error: ${err}`))
    
    } 
})

// REACTION ROLE CODE 
const reactschema = require('./src/schemas/reactionrole');

bot.on(Events.MessageReactionAdd, async (reaction, member) => {

  try {
      await reaction.fetch();
  } catch (error) {
      return;
  }

  if (!reaction.message.guild) return;
  else {

      const reactionroledata = await reactschema.find({ MessageID: reaction.message.id });

      await Promise.all(reactionroledata.map(async data => {
          if (reaction.emoji.id !== data.Emoji) return;
          else {

              const role = await reaction.message.guild.roles.cache.get(data.Roles);
              const addmember = await reaction.message.guild.members.fetch(member.id);

              if (!role) return;
              else {

                  try {
                      await addmember.roles.add(role)
                  } catch (err) {
                      return console.log(err);
                  }

                  try {

                      const addembed = new EmbedBuilder()
                      .setColor('DarkRed')
                      .setAuthor({ name: `💳 Reaction Role Tool`})
                      .setFooter({ text: `💳 Role Added`})
                      .setTitle('> You have been given a role!')
                      .setTimestamp()
                      .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081267701302972476/largered.png')
                      .addFields({ name: `• Role`, value: `> ${role.name}`, inline: true}, { name: `• Emoji`, value: `> ${reaction.emoji}`, inline: true}, { name: `• Server`, value: `> ${reaction.message.guild.name}`, inline: false})
                      addmember.send({ embeds: [addembed] })
  
                  } catch (err) {
                      return;
                  }
              }
          }
      }))
  }
})

bot.on(Events.MessageReactionRemove, async (reaction, member) => {

  try {
      await reaction.fetch();
  } catch (error) {
      return;
  }

  if (!reaction.message.guild) return;
  else {

      const reactionroledata = await reactschema.find({ MessageID: reaction.message.id });

      await Promise.all(reactionroledata.map(async data => {
          if (reaction.emoji.id !== data.Emoji) return;
          else {

              const role = await reaction.message.guild.roles.cache.get(data.Roles);
              const addmember = await reaction.message.guild.members.fetch(member.id);

              if (!role) return;
              else {

                  try {
                      await addmember.roles.remove(role)
                  } catch (err) {
                      return console.log(err);
                  }

                  try {

                      const removeembed = new EmbedBuilder()
                      .setColor('DarkRed')
                      .setAuthor({ name: `💳 Reaction Role Tool`})
                      .setFooter({ text: `💳 Role Removed`})
                      .setTitle('> You have removed from a role!')
                      .setTimestamp()
                      .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081267701302972476/largered.png')
                      .addFields({ name: `• Role`, value: `> ${role.name}`, inline: true}, { name: `• Emoji`, value: `> ${reaction.emoji}`, inline: true}, { name: `• Server`, value: `> ${reaction.message.guild.name}`, inline: false})
                      addmember.send({ embeds: [removeembed] })
  
                  } catch (err) {
                      return;
                  }
              }
          }
      }))
  }
})


// JOIN TO CREATE VOICE CHANNEL CODE //

const joinschema = require('./src/schemas/jointocreate');
const joinchannelschema = require('./src/schemas/jointocreatechannels');


bot.on(Events.VoiceStateUpdate, async (oldState, newState) => {

  try {
      if (newState.member.guild === null) return;
  } catch (err) {
      return;
  }

  if (newState.member.id === '1076798263098880116') return;

  const joindata = await joinschema.findOne({ Guild: newState.member.guild.id });
  const joinchanneldata1 = await joinchannelschema.findOne({ Guild: newState.member.guild.id, User: newState.member.id });

  const voicechannel = newState.channel;

  if (!joindata) return;

  if (!voicechannel) return;
  else {

      if (voicechannel.id === joindata.Channel) {

          if (joinchanneldata1) {
              
              try {

                  const joinfail = new EmbedBuilder()
                  .setColor('DarkRed')
                  .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081267701302972476/largered.png')
                  .setTimestamp()
                  .setAuthor({ name: `🔊 Join to Create System`})
                  .setFooter({ text: `🔊 Issue Faced`})
                  .setTitle('> You tried creating a \n> voice channel but..')
                  .addFields({ name: `• Error Occured`, value: `> You already have a voice channel \n> open at the moment.`})

                  return await newState.member.send({ embeds: [joinfail] });

              } catch (err) {
                  return;
              }

          } else {

              try {

                  const channel = await newState.member.guild.channels.create({
                      type: ChannelType.GuildVoice,
                      name: `${newState.member.user.username}-room`,
                      userLimit: joindata.VoiceLimit,
                      parent: joindata.Category
                  })
                  
                  try {
                      await newState.member.voice.setChannel(channel.id);
                  } catch (err) {
                      console.log('Error moving member to the new channel!')
                  }   

                  setTimeout(() => {

                      joinchannelschema.create({
                          Guild: newState.member.guild.id,
                          Channel: channel.id,
                          User: newState.member.id
                      })

                  }, 500)
                  
              } catch (err) {

                  console.log(err)

                  try {

                      const joinfail = new EmbedBuilder()
                      .setColor('DarkRed')
                      .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081267701302972476/largered.png')
                      .setTimestamp()
                      .setAuthor({ name: `🔊 Join to Create System`})
                      .setFooter({ text: `🔊 Issue Faced`})
                      .setTitle('> You tried creating a \n> voice channel but..')
                      .addFields({ name: `• Error Occured`, value: `> I could not create your channel, \n> perhaps I am missing some permissions.`})
  
                      await newState.member.send({ embeds: [joinfail] });
  
                  } catch (err) {
                      return;
                  }

                  return;

              }

              try {

                  const joinsuccess = new EmbedBuilder()
                  .setColor('DarkRed')
                  .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081267701302972476/largered.png')
                  .setTimestamp()
                  .setAuthor({ name: `🔊 Join to Create System`})
                  .setFooter({ text: `🔊 Channel Created`})
                  .setTitle('> Channel Created')
                  .addFields({ name: `• Channel Created`, value: `> Your voice channel has been \n> created in **${newState.member.guild.name}**!`})

                  await newState.member.send({ embeds: [joinsuccess] });

              } catch (err) {
                  return;
              }
          }
      }
  }
})

bot.on(Events.VoiceStateUpdate, async (oldState, newState) => {

  try {
      if (oldState.member.guild === null) return;
  } catch (err) {
      return;
  }

  if (oldState.member.id === '1076798263098880116') return;

  const leavechanneldata = await joinchannelschema.findOne({ Guild: oldState.member.guild.id, User: oldState.member.id });

  if (!leavechanneldata) return;
  else {

      const voicechannel = await oldState.member.guild.channels.cache.get(leavechanneldata.Channel);

      if (newState.channel === voicechannel) return;

      try {
          await voicechannel.delete()
      } catch (err) {
          return;
      }

      await joinchannelschema.deleteMany({ Guild: oldState.guild.id, User: oldState.member.id })
      try {

          const deletechannel = new EmbedBuilder()
          .setColor('DarkRed')
          .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081267701302972476/largered.png')
          .setTimestamp()
          .setAuthor({ name: `🔊 Join to Create System`})
          .setFooter({ text: `🔊 Channel Deleted`})
          .setTitle('> Channel Deleted')
          .addFields({ name: `• Channel Deleted`, value: `> Your voice channel has been \n> deleted in **${newState.member.guild.name}**!`})

          await newState.member.send({ embeds: [deletechannel] });

      } catch (err) {
          return;
      } 
  }
})


// Anti-Link System Code //

const warningSchema = require('./src/schemas/warnings')

const linkSchema = require('./src/schemas/link');

bot.on(Events.MessageCreate, async (message) => {

    if (message.guild === null) return;
     
    if (message.content.startsWith('http') || message.content.startsWith('discord.gg') || message.content.includes('https://') || message.content.includes('http://') || message.content.includes('discord.gg/') || message.content.includes('www.') || message.content.includes('.net') || message.content.includes('.com')) {

        const Data = await linkSchema.findOne({ Guild: message.guild.id });

        if (!Data) return;

        const memberPerms = Data.Perms;

        const user = message.author;
        const member = message.guild.members.cache.get(user.id);

        const embed = new EmbedBuilder()
        .setColor("DarkRed")
        .setAuthor({ name: '🔗 Anti-link system'})
        .setTitle('Message removed')
        .setFooter({ text: '🔗 Anti-link detected a link'})
        .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
        .setDescription(`> ${message.author}, links are **disabled** in **${message.guild.name}**.`)
        .setTimestamp()

        if (member.permissions.has(memberPerms)) return;
        else {
            await message.channel.send({ embeds: [embed] }).then (msg => {
                setTimeout(() => msg.delete(), 5000)
            })

            ;(await message).delete();

            warningSchema.findOne({ GuildID: message.guild.id, UserID: message.author.id, UserTag: message.author.tag }, async (err, data) => {

                if (err) throw err;
    
                if (!data) {
                    data = new warningSchema({
                        GuildID: message.guild.id,
                        UserID: message.author.id,
                        UserTag: message.author.tag,
                        Content: [
                            {
                                ExecuterId: '1082544311431860254',
                                ExecuterTag: 'Maru v2#5677',
                                Reason: 'Use of forbidden links'
                            }
                        ],
                    });
     
                } else {
                    const warnContent = {
                        ExecuterId: '1082544311431860254',
                        ExecuterTag: 'Maru v2#5677',
                        Reason: 'Use of forbidden links'
                    }
                    data.Content.push(warnContent);
                }
                data.save()
            })
        }
    }
})

// Mod logs //
const Modlog = require('./src/schemas/modlog');

bot.on(Events.ChannelCreate, async (channel) => {
  const guildId = channel.guild.id;
  const modlog = await Modlog.findOne({ guildId });

  if (!modlog || !modlog.logChannelId || !modlog.options.includes('channelCreates')) {
    return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
}

  channel.guild.fetchAuditLogs({
    type: AuditLogEvent.ChannelCreate,
  })
    .then(async (audit) => {
      const { executor } = audit.entries.first();

      const name = channel.name;
      const id = channel.id;
      let type = channel.type;

      if (type == 0) type = 'Text'
      if (type == 2) type = 'Voice'
      if (type == 13) type = 'Stage'
      if (type == 15) type = 'Form'
      if (type == 4) type = 'Announcement'
      if (type == 5) type = 'Category'

      const mChannel = await channel.guild.channels.cache.get(modlog.logChannelId);

      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('Channel Created')
        .addFields({ name: 'Channel Name', value: `${name} (<#${id}>)`, inline: false })
        .addFields({ name: 'Channel Type', value: `${type} `, inline: true })
        .addFields({ name: 'Channel ID', value: `${id} `, inline: true })
        .addFields({ name: 'Created By', value: `${executor.tag}`, inline: false })
        .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
        .setTimestamp()
        .setFooter({ text: 'Mod Logging by Maru v2' });

    mChannel.send({ embeds: [embed] })

    })
})

bot.on(Events.ChannelDelete, async channel => {
    const Modlog = require('./src/schemas/modlog');

    const guildId = channel.guild.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('channelDeletes')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }

    channel.guild.fetchAuditLogs({
        type: AuditLogEvent.ChannelDelete,
    })
    .then (async audit => {
        const { executor } = audit.entries.first()

        const name = channel.name;
        const id = channel.id;
        let type = channel.type;

        if (type == 0) type = 'Text'
        if (type == 2) type = 'Voice'
        if (type == 13) type = 'Stage'
        if (type == 15) type = 'Form'
        if (type == 4) type = 'Announcement'
        if (type == 5) type = 'Category'

        const mChannel = await channel.guild.channels.cache.get(modlog.logChannelId);

    const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle("Channel Deleted")
    .addFields({ name: "Channel Name", value: `${name}`, inline: false})
    .addFields({ name: "Channel Type", value: `${type} `, inline: true})
    .addFields({ name: "Channel ID", value: `${id} `, inline: true})
    .addFields({ name: "Deleted By", value: `${executor.tag}`, inline: false})
    .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
    .setTimestamp()
    .setFooter({ text: "Mod Logging by Maru v2"})

    mChannel.send({ embeds: [embed] })

     })
})

bot.on(Events.GuildBanAdd, async member => {
    const Modlog = require('./src/schemas/modlog');

    const guildId = member.guild.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId) {
        return; // if there's no log channel set up, return without sending any log message
    }

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('memberBans')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }

    member.guild.fetchAuditLogs({
        type: AuditLogEvent.GuildBanAdd,
    })
    .then (async audit => {
        const { executor } = audit.entries.first()

        const name = member.user.username;
        const id = member.user.id;
 
   
    const mChannel = await member.guild.channels.cache.get(modlog.logChannelId)

    const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle("Member Banned")
    .addFields({ name: "Member Name", value: `${name} (<@${id}>)`, inline: false})
    .addFields({ name: "Member ID", value: `${id} `, inline: true})
    .addFields({ name: "Banned By", value: `${executor.tag}`, inline: false})
    .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
    .setTimestamp()
    .setFooter({ text: "Mod Logging by Maru v2"})

    mChannel.send({ embeds: [embed] })

    })
})

bot.on(Events.GuildBanRemove, async member => {
    const Modlog = require('./src/schemas/modlog');

    const guildId = member.guild.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId) {
        return; // if there's no log channel set up, return without sending any log message
    }

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('memberUnbans')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }


    member.guild.fetchAuditLogs({
        type: AuditLogEvent.GuildBanRemove,
    })
    .then (async audit => {
        const { executor } = audit.entries.first()

        const name = member.user.username;
        const id = member.user.id;
 
   
    const mChannel = await member.guild.channels.cache.get(modlog.logChannelId)

    const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle("Member Unbanned")
    .addFields({ name: "Member Name", value: `${name} (<@${id}>)`, inline: false})
    .addFields({ name: "Member ID", value: `${id} `, inline: true})
    .addFields({ name: "Unbanned By", value: `${executor.tag}`, inline: false})
    .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
    .setTimestamp()
    .setFooter({ text: "Mod Logging by Maru v2"})

    mChannel.send({ embeds: [embed] })

    })
})

bot.on(Events.MessageDelete, async (message) => {
    const Modlog = require('./src/schemas/modlog');
    const guildId = message.guild.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('messageDelete')) {
        return; // if there's no log channel set up or messageDelete option is not enabled, return without sending any log message
    }

    // get the user who posted the deleted message
    const author = message.author;

    message.guild.fetchAuditLogs({
        type: AuditLogEvent.MessageDelete,
    })
    .then (async audit => {
        const { executor } = audit.entries.first()

        const mes = message.content;

        if (!mes) return

        const mChannel = await message.guild.channels.cache.get(modlog.logChannelId)

        const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`Message Deleted`)
        .setDescription(`Message posted by  <@${author.id}> has been deleted.`)
        .addFields({ name: "Message Content", value: `${mes}`, inline: false})
        .addFields({ name: "Message Channel", value: `${message.channel} `, inline: true})
        .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
        .setTimestamp()
        .setFooter({ text: "Mod Logging by Maru v2"})

        mChannel.send({ embeds: [embed] })

    })
})
  

bot.on(Events.MessageUpdate, async (message, newMessage) => {
    const Modlog = require('./src/schemas/modlog');

    const guildId = message.guild.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('messageEdits')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }


    message.guild.fetchAuditLogs({
        type: AuditLogEvent.MessageUpdate,
    })
    .then (async audit => {
        const { executor } = audit.entries.first()

        const mes = message.content;
        
        if (!mes) return

    const mChannel = await message.guild.channels.cache.get(modlog.logChannelId)

    const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle("Message Edited")
    .addFields({ name: "Old Message", value: `${mes}`, inline: false})
    .addFields({ name: "New Message", value: `${newMessage} `, inline: true})
    .addFields({ name: "Edited By", value: `<@${message.author.id}>`, inline: false})
    .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
    .setTimestamp()
    .setFooter({ text: "Mod Logging by Maru v2"})

    mChannel.send({ embeds: [embed] })

    })
})

bot.on(Events.MessageBulkDelete, async messages => {
    const Modlog = require('./src/schemas/modlog');

    const guildId = messages.first().guild.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('messageDeleteBulk')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }

    messages.first().guild.fetchAuditLogs({
        type: AuditLogEvent.MessageBulkDelete,
    })
    .then(async audit => {
        const { executor } = audit.entries.first();

        const mChannel = await messages.first().guild.channels.cache.get(modlog.logChannelId);

        const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Message Bulk Delete")
        .addFields({ name: "Message Channel", value: `${messages.first().channel} `, inline: true})
        .addFields({ name: "Bulk Deleted By", value: `${executor.tag}`, inline: false})
        .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
        .setTimestamp()
        .setFooter({ text: "Mod Logging by Maru v2" });

        mChannel.send({ embeds: [embed] });
    });
});

bot.on(Events.GuildRoleCreate, async role => {
    const Modlog = require('./src/schemas/modlog');

    const guildId = role.guild.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('roleCreates')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }

    role.guild.fetchAuditLogs({
        type: AuditLogEvent.RoleCreate,
    })
    .then(async audit => {
        const { executor } = audit.entries.first();

        const mChannel = await role.guild.channels.cache.get(modlog.logChannelId);

        const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Role Created")
        .addFields({ name: "Role Name", value: `<@&${role.id}> `, inline: true})
        .addFields({ name: "Role Created By", value: `${executor.tag}`, inline: false})
        .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
        .setTimestamp()
        .setFooter({ text: "Mod Logging by Maru v2" });

        mChannel.send({ embeds: [embed] });
    });
});


    

bot.on(Events.GuildRoleDelete, async role => {
    const Modlog = require('./src/schemas/modlog');

    const guildId = role.guild.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('roleDeletes')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }

    role.guild.fetchAuditLogs({
        type: AuditLogEvent.RoleDelete,
    })
    .then(async audit => {
        const { executor } = audit.entries.first();

        const mChannel = await role.guild.channels.cache.get(modlog.logChannelId);

        const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Role Deleted")
        .addFields({ name: "Role Name", value: `${role.name} (${role.id})`, inline: true})
        .addFields({ name: "Role Deleted By", value: `${executor.tag}`, inline: false})
        .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
        .setTimestamp()
        .setFooter({ text: "Mod Logging by Maru v2" });

        mChannel.send({ embeds: [embed] });
    });
});


bot.on(Events.GuildMemberAdd, async member => {
    const Modlog = require('./src/schemas/modlog');

    const guildId = member.guild.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('memberJoins')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }

    const mChannel = await member.guild.channels.cache.get(modlog.logChannelId);

    const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Member Joined")
        .addFields({ name: "Username", value: `${member.user.username}#${member.user.discriminator} (${member.user.id})`, inline: true})
        .addFields({ name: "Joined At", value: `${member.joinedAt.toUTCString()}`, inline: true})
        .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
        .setTimestamp()
        .setFooter({ text: "Mod Logging by Maru v2" });

    mChannel.send({ embeds: [embed] });
});


bot.on(Events.GuildMemberRemove, async member => {
    const Modlog = require('./src/schemas/modlog');

    const guildId = member.guild.id;
    const modlog = await Modlog.findOne({ guildId });


    if (!modlog || !modlog.logChannelId || !modlog.options.includes('memberLeaves')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }

    const mChannel = await member.guild.channels.cache.get(modlog.logChannelId);

    const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Member Left")
        .addFields({ name: "Username", value: `${member.user.username}#${member.user.discriminator} (${member.user.id})`, inline: true})
        .addFields({ name: "Left At", value: `${new Date().toUTCString()}`, inline: true})
        .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
        .setTimestamp()
        .setFooter({ text: "Mod Logging by Maru v2" });

    mChannel.send({ embeds: [embed] });
});


bot.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    if (oldMember.nickname === newMember.nickname) {
        return; // if the nickname hasn't changed, return without sending any log message
    }

    const Modlog = require('./src/schemas/modlog');

    const guildId = newMember.guild.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('nicknameUpdate')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }

    const mChannel = await newMember.guild.channels.cache.get(modlog.logChannelId);

    const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Nickname Changed")
        .addFields({ name: "Username", value: `${newMember.user.username}#${newMember.user.discriminator} (${newMember.user.id})`, inline: true })
        .addFields({ name: "Old Nickname", value: `${oldMember.nickname ? oldMember.nickname : 'None'}`, inline: true })
        .addFields({ name: "New Nickname", value: `${newMember.nickname ? newMember.nickname : 'None'}`, inline: true })
        .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
        .setTimestamp()
        .setFooter({ text: "Mod Logging by Maru v2" });

    mChannel.send({ embeds: [embed] });
});


bot.on(Events.UserUpdate, async (oldUser, newUser) => {
    if (oldUser.username === newUser.username) {
        return; // if the username hasn't changed, return without sending any log message
    }

    const Modlog = require('./src/schemas/modlog');

    const guildId = newUser.guild.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('nameUpdate')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }


    const mChannel = await newUser.guild.channels.cache.get(modlog.logChannelId);

    const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Username Changed")
        .addFields({ name: "User", value: `${newUser.username}#${newUser.discriminator} (${newUser.id})`, inline: true })
        .addFields({ name: "Old Username", value: `${oldUser.username}`, inline: true })
        .addFields({ name: "New Username", value: `${newUser.username}`, inline: true })
        .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
        .setTimestamp()
        .setFooter({ text: "Mod Logging by Maru v2" });

    mChannel.send({ embeds: [embed] });
});


bot.on(Events.UserUpdate, async (oldUser, newUser) => {
    try {
    if (oldUser.avatar === newUser.avatar) return; // if the avatar didn't change, return without sending any log message
    const Modlog = require('./src/schemas/modlog');

    const guildId = newUser.guild?.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('avatarChanged')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }

    const mChannel = await newUser.guild.channels.cache.get(modlog.logChannelId);

    const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Avatar Changed")
        .addFields({ name: 'User', value: `${newUser.username}#${newUser.discriminator} (${newUser.id})` })
        .setThumbnail(newUser.displayAvatarURL())
        .setFooter({ text: "Mod Logging by Maru v2" });

    mChannel.send({ embeds: [embed] });
} catch (error) {
    console.error(error);
   }
})










bot.on(Events.GuildMemberRemove, async (member) => {
    const Modlog = require('./src/schemas/modlog');

    const guildId = member.guild.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('memberKicks')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }

    member.guild.fetchAuditLogs({
        type: AuditLogEvent.MemberKick,
    })
    .then (async audit => {
        const kickLog = audit.entries.find(entry => entry.target.id === member.id && entry.actionType === 20);

        if (!kickLog) {
            return; // member left on their own, not kicked
        }

        const { executor } = kickLog;

        const mChannel = await member.guild.channels.cache.get(modlog.logChannelId);

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Member Kicked")
            .addFields({ name: 'User', value: `${member.user.username}#${member.user.discriminator} (${member.user.id})` })
            .addFields({ name: "Kicked By", value: `${executor.tag}`, inline: false})
            .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
            .setFooter({ text: "Mod Logging by Maru v2" });

        mChannel.send({ embeds: [embed] });
    })
});


bot.on(Events.InviteCreate, async (invite) => {
    const Modlog = require('./src/schemas/modlog');

    const guildId = invite.guild.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('inviteCreated')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }

    const mChannel = await invite.guild.channels.cache.get(modlog.logChannelId);

    const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Invite Created")
        .addFields({ name: "Code", value: `${invite.code}`, inline: true })
        .addFields({ name: "Channel", value: `${invite.channel}`, inline: true })
        .addFields({ name: "Inviter", value: `${invite.inviter}`, inline: true })
        .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
        .setTimestamp()
        .setFooter({ text: "Mod Logging by Maru v2" });

    mChannel.send({ embeds: [embed] });
});

bot.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    const Modlog = require('./src/schemas/modlog');

    const guildId = newMember.guild.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('roleAdded')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }
    newMember.guild.fetchAuditLogs({
        type: AuditLogEvent.MemberUpdate,
    })
    .then (async audit => {

        const { executor } = audit.entries.first();

        const mChannel = await newMember.guild.channels.cache.get(modlog.logChannelId);

        if (oldMember.roles.cache.size < newMember.roles.cache.size) {
          const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
          const roleNameArray = addedRoles.map(role => `<@&${role.id}>`);
          const rolesAddedString = roleNameArray.join(", ");
      
          const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Roles Added")
            .addFields(
              { name: "User", value: `<@${newMember.id}>`, inline: true },
              { name: "Roles Added", value: rolesAddedString, inline: true },
              { name: "Role Added By", value: `${executor.tag}`, inline: false }
            )
            .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
            .setTimestamp()
            .setFooter({ text: "Mod Logging by Maru v2"});
      
          mChannel.send({ embeds: [embed] });
        }
    })
});
  

bot.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    const Modlog = require('./src/schemas/modlog');

    const guildId = newMember.guild.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('roleRemoved')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }

    newMember.guild.fetchAuditLogs({
        type: AuditLogEvent.MemberRoleUpdate,
    })
    .then (async audit => {

        const { executor } = audit.entries.first();
        const mChannel = await newMember.guild.channels.cache.get(modlog.logChannelId);

        if (oldMember.roles.cache.size > newMember.roles.cache.size) {
            const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
            const roleNameArray = removedRoles.map(role => `<@&${role.id}>`);
            const rolesRemovedString = roleNameArray.join(", ");

            const embed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("Roles Removed")
                .addFields(
                    { name: "User", value: `<@${newMember.id}>`, inline: true },
                    { name: "Roles Removed", value: rolesRemovedString, inline: true },
                    { name: "Role Removed By", value: `${executor.tag}`, inline: false }
                )
                .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
                .setTimestamp()
                .setFooter({ text: "Mod Logging by Maru v2"});

            mChannel.send({ embeds: [embed] });
        }
    });
});


bot.on(Events.ChannelUpdate, async (channel, oldChannel) => {
    const Modlog = require('./src/schemas/modlog');

    const guildId = channel.guild.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('channelUpdates')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }

    channel.guild.fetchAuditLogs({
        type: AuditLogEvent.ChannelUpdate,
        limit: 1,
    })
    .then(async (audit) => {
        const { executor } = audit.entries.first();

        const name = oldChannel.name !== channel.name ? `${oldChannel.name} -> ${channel.name}` : channel.name;
        const id = channel.id;
        let type = channel.type;

        if (type == 0) type = 'Text';
        if (type == 2) type = 'Voice';
        if (type == 13) type = 'Stage';
        if (type == 15) type = 'Form';
        if (type == 4) type = 'Announcement';
        if (type == 5) type = 'Category';

        const mChannel = await channel.guild.channels.cache.get(modlog.logChannelId);

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Channel Updated")
            .addFields({ name: "Channel Name", value: `${name}`, inline: false })
            .addFields({ name: "Channel Type", value: `${type} `, inline: true })
            .addFields({ name: "Channel ID", value: `${id} `, inline: true })
            .addFields({ name: "Updated By", value: `${executor.tag}`, inline: false })
            .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
            .setTimestamp()
            .setFooter({ text: "Mod Logging by Maru v2" });

        mChannel.send({ embeds: [embed] });

    })
    .catch(console.error);
});


bot.on(Events.GuildEmojiCreate, async (channel, oldChannel) => {
    const Modlog = require('./src/schemas/modlog');

    const guildId = channel.guild.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('channelUpdates')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }

    channel.guild.fetchAuditLogs({
        type: AuditLogEvent.ChannelUpdate,
        limit: 1,
    })
    .then(async (audit) => {
        const { executor } = audit.entries.first();

        const name = oldChannel.name !== channel.name ? `${oldChannel.name} -> ${channel.name}` : channel.name;
        const id = channel.id;
        let type = channel.type;

        if (type == 0) type = 'Text';
        if (type == 2) type = 'Voice';
        if (type == 13) type = 'Stage';
        if (type == 15) type = 'Form';
        if (type == 4) type = 'Announcement';
        if (type == 5) type = 'Category';

        const mChannel = await channel.guild.channels.cache.get(modlog.logChannelId);

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Channel Updated")
            .addFields({ name: "Channel Name", value: `${name}`, inline: false })
            .addFields({ name: "Channel Type", value: `${type} `, inline: true })
            .addFields({ name: "Channel ID", value: `${id} `, inline: true })
            .addFields({ name: "Updated By", value: `${executor.tag}`, inline: false })
            .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
            .setTimestamp()
            .setFooter({ text: "Mod Logging by Maru v2" });

        mChannel.send({ embeds: [embed] });

    })
    .catch(console.error);
});


bot.on(Events.GuildEmojiCreate, async (emoji) => {
    const Modlog = require('./src/schemas/modlog');

    const guildId = emoji.guild.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('emojiCreates')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }

    emoji.guild.fetchAuditLogs({
        type: AuditLogEvent.EmojiCreate,
        limit: 1,
    })
    .then(async (audit) => {
        const { executor } = audit.entries.first();

        const name = emoji.name;
        const id = emoji.id;
        const animated = emoji.animated;

        const mChannel = await emoji.guild.channels.cache.get(modlog.logChannelId);

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Emoji Added")
            .setDescription(`Emoji ${animated ? "animated " : ""}was added by ${executor.tag}`)
            .addFields({ name: "Emoji Name", value: `${name}`, inline: false })
            .addFields({ name: "Emoji ID", value: `${id} `, inline: true })
            .setThumbnail(emoji.url)
            .setTimestamp()
            .setFooter({ text: "Mod Logging by Maru v2" });

        mChannel.send({ embeds: [embed] });

    })
    .catch(console.error);
});


bot.on(Events.GuildEmojiDelete, async (emoji) => {
    const Modlog = require('./src/schemas/modlog');

    const guildId = emoji.guild.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('emojiDeletes')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }

    emoji.guild.fetchAuditLogs({
        type: AuditLogEvent.EmojiDelete,
        limit: 1,
    })
    .then(async (audit) => {
        const { executor } = audit.entries.first();

        const name = emoji.name;
        const id = emoji.id;

        const mChannel = await emoji.guild.channels.cache.get(modlog.logChannelId);

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Emoji Deleted")
            .addFields({ name: "Emoji Name", value: `${name}`, inline: false })
            .addFields({ name: "Emoji ID", value: `${id} `, inline: true })
            .addFields({ name: "Deleted By", value: `${executor.tag}`, inline: false })
            .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
            .setTimestamp()
            .setFooter({ text: "Mod Logging by Maru v2" });

        mChannel.send({ embeds: [embed] });

    })
    .catch(console.error);
});


bot.on(Events.GuildStickerCreate, async (sticker) => {
    const Modlog = require('./src/schemas/modlog');

    const guildId = sticker.guild.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('stickerCreates')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }

    sticker.guild.fetchAuditLogs({
        type: AuditLogEvent.StickerCreate,
        limit: 1,
    })
    .then(async (audit) => {
        const { executor } = audit.entries.first();

        const name = sticker.name;
        const id = sticker.id;

        const mChannel = await sticker.guild.channels.cache.get(modlog.logChannelId);

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Sticker Created")
            .addFields({ name: "Name", value: `${name}`, inline: true })
            .addFields({ name: "ID", value: `${id} `, inline: true })
            .addFields({ name: "Created By", value: `${executor.tag}`, inline: false })
            .setThumbnail(sticker.url)
            .setTimestamp()
            .setFooter({ text: "Mod Logging by Maru v2" });

        mChannel.send({ embeds: [embed] });

    })
    .catch(console.error);
});


bot.on(Events.GuildStickerDelete, async (sticker) => {
    const Modlog = require('./src/schemas/modlog');

    const guildId = sticker.guild.id;
    const modlog = await Modlog.findOne({ guildId });

    if (!modlog || !modlog.logChannelId || !modlog.options.includes('stickerDeletes')) {
        return; // if there's no log channel set up or messageUpdate is not enabled, return without sending any log message
    }

    sticker.guild.fetchAuditLogs({
        type: AuditLogEvent.StickerDelete,
        limit: 1,
    })
    .then(async (audit) => {
        const { executor } = audit.entries.first();

        const name = sticker.name;
        const id = sticker.id;
        const mChannel = await sticker.guild.channels.cache.get(modlog.logChannelId);

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Sticker Deleted")
            .addFields({ name: "Sticker Name", value: `${name}`, inline: false })
            .addFields({ name: "Sticker ID", value: `${id} `, inline: true })
            .addFields({ name: "Deleted By", value: `${executor.tag}`, inline: false })
            .setThumbnail(sticker.url)
            .setTimestamp()
            .setFooter({ text: "Mod Logging by Maru v2" });

        mChannel.send({ embeds: [embed] });

    })
    .catch(console.error);
});








    


