//const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
    let users = bot.users;

    let searchTerm = args[1];
    if (!searchTerm) return message.channel.send("GIVE ME A HINT");
    
    let matches = users.filter(u => u.tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    message.channel.send(matches.map(u => u.tag));
}

module.exports.help = {
    name: 'findusers'
}