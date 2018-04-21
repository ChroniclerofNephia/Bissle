const api = "https://jsonplaceholder.typicode.com/posts";
const snekfetch = require("snekfetch");
const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
    snekfetch .get(api).then(r => {
        let body = r.body;
        let id = Number(args[1]);
        if (!id) return message.channel.send("GIVE ME AN ID!");
        if (isNaN(id)) return message.channel.send("I NEED A NUMERICAL ID, YOU TWIT!");

        let entry = body.find(post => post.id === id);
        if (!entry) return message.channel.send("THIS ENTRY DOES NOT EXIST!");

        let embed = new Discord.RichEmbed()
            .setAuthor(entry.title)
            .setDescription(entry.body)
            .addField("Author ID", entry.userId)
            .setFooter("Post ID:" + entry.id);
        message.channel.send(embed);
    });
}

module.exports.help = {
    name: 'test'
}