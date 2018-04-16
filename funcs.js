const Discord = require('discord.js');

module.exports = {
    randColor : function() {
        return '#'+Math.floor(Math.random()*16777215).toString(16);
    },
    
    invalid: function(message) {
        var responses = [
            "Speak up, kiddo! I didn't understand a word you said.",
            "WHAT DID YOU CALL ME YOU LITTLE TWERP?!",
            "That didn't make a lick of sense.",
            "Sorry, I don't speak abyssal.",
            "Sorry, " + message.author.toString() + ". I don't know what the fuck that means.",
            new Discord.RichEmbed().setImage('https://i.imgur.com/6DN4q4L.gif').setColor(randColor()),
        ];
        let x = Math.floor(Math.random()*(responses.length+1));
        if (x != responses.length) return message.channel.send(responses[x]);
        var c = 9;
        var interval = setInterval (function () {
            // use the message's channel (TextChannel) to send a new message
            if (c == 9) {
                message.channel.send('**SERVER RESET IN T-MINUS 10...**');
            }
            message.channel.send('**'+c--+'...**')
            .catch(console.error); // add error handling here
            if (c == 0) {
                clearInterval(interval);
                return;
            }
        }, 1000);
    },
    
    isNorrick: function(message) {
        return (message.member.nickname == 'Loreseeker Norrick') && message.member.roles.find("name" , "Admins");
    }
}

function randColor() {
    return '#'+Math.floor(Math.random()*16777215).toString(16);
}