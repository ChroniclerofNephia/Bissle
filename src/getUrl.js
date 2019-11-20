const botSettings = require('./botsettings')

const Discord = require('discord.js')

const bot = new Discord.Client()

bot.on('ready', () => {

  bot.generateInvite(["ADMINISTRATOR"])
  .then(link => {
    console.log('Your discord bot url is:')
    console.log(link)
  })
  .catch(err => {
    console.log('There was an error generating the discord bot invite: ', err)
  })
})

bot.login(botSettings.token)