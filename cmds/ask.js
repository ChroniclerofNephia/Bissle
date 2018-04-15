let fortunes = [
    "Most definitely.",
    "Probably.",
    "That's highly unlikely. Nearly impossible.",
    "Nope.",
    "Maybe.",
    "How the heck should I know?! I'm just a bot!",
    "¯\\_(ツ)_/¯",
    'https://www.youtube.com/watch?v=yIhUYaLXOMs',
];

module.exports.run = async (bot, message, args) => {
    if (args[1]) message.channel.send(fortunes[Math.floor(Math.random() * fortunes.length)]);
    else message.channel.send("Speak up sonny! I didn't hear your question.");
}

module.exports.help = {
    name: 'ask'
}