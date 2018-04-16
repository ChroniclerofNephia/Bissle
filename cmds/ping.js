const funcs = module.require('../funcs.js');
const Discord = module.require("discord.js");

let pings = [
    "Don't f@%$ing ping me, you d&*#s@#&&%er!",
    "You know pings are just a cry for help.",
    "I bet this is really fun for you isn't it.",
    "...",
    "Please stop.",
    "(╯°□°）╯︵ ┻━┻",
    new Discord.RichEmbed().setColor(funcs.randColor())
        .setImage('http://gifimage.net/wp-content/uploads/2017/07/critical-role-gif-6.gif'),
    new Discord.RichEmbed().setColor(funcs.randColor())
        .setImage('https://i.giphy.com/media/3o7WTAWQI5G3Xmym88/giphy.webp'),
    new Discord.RichEmbed().setColor(funcs.randColor())
        .setImage('https://i.imgur.com/QUfjucN.gif'),
    new Discord.RichEmbed().setColor(funcs.randColor())
        .setImage('https://media0.giphy.com/media/xUPGcKbFxXKsmeEZpu/giphy-downsized.gif'),
]

module.exports.run = async (bot, message, args) => {
    let x = Math.floor(Math.random()*(pings.length+1));
    if (x == pings.length) {
        message.react(bot.emojis.find("name", "disgust"));
        message.react(bot.emojis.find("name", "gfdi"));
        message.react(bot.emojis.find("name", "banhammer"));
        message.react(bot.emojis.find("name", "blackflare"));
        return;
    }
    message.channel.send(pings[x]);
}

module.exports.help = {
    name: 'ping'
}