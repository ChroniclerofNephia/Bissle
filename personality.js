const Discord = module.require("discord.js");

const ASK = [
    "Most definitely.",
    "Probably.",
    "That's highly unlikely. Nearly impossible.",
    "Nope.",
    "Maybe.",
    "How the heck should I know?! I'm just a bot!",
    "¯\\_(ツ)_/¯",
    'https://www.youtube.com/watch?v=yIhUYaLXOMs',
];
const INVALID = [
    "Speak up, kiddo! I didn't understand a word you said.",
    "WHAT DID YOU CALL ME YOU LITTLE TWERP?!",
    "That didn't make a lick of sense.",
    "Sorry, I don't speak abyssal.",
    //"Sorry, " + message.author.toString() + ". I don't know what the fuck that means.",
    'https://www.youtube.com/watch?v=iHW1ho8L7V8',
    '¡Pobrecito! ¿Quién te dejó caer en tu cabeza?',
    "Perhaps you should try again after the **Feeblemind** has worn off.",
    new Discord.RichEmbed().setImage('https://i.imgur.com/6DN4q4L.gif').setColor(randColor()),
    new Discord.RichEmbed().setImage('https://pbs.twimg.com/profile_images/877240012357685248/k3g8BV09.jpg').setColor(randColor()),
];
const DOBIDDING = [
    "***Bissle will remember that.***",
    "I'll be reporting this.",
    "*takes notes vigorously*",
    "*hefts hand-me-down banhammer*\nYou wanna play? Let's play.",
];
const PING = [
    "Don't f@%$ing ping me, you d&*#s@#&&%er!",
    "You know pings are just a cry for help.",
    "I bet this is really fun for you isn't it.",
    "...",
    "Please stop.",
    "(╯°□°）╯︵ ┻━┻",
    new Discord.RichEmbed().setColor(randColor())
        .setImage('https://i.imgur.com/QUfjucN.gif'),
    new Discord.RichEmbed().setColor(randColor())
        .setImage('https://media0.giphy.com/media/xUPGcKbFxXKsmeEZpu/giphy-downsized.gif'),
];

const LFG = [
    "I sharted all over your file and can't add you to LFG.", // Something went wrong
    'Sorry, kid. Folks like their live games.', // Empty PBP list
    "Weird. Need more meat for the grinder. Invite some friends!", // Empty LFG-low
    'Too busy FTBing to LFG. Tell \'em to get a life and play D&D with you!', // Empty LFG-mid
    'Apparently they\'ve all been annihilated by spheres of varying sizes. Shame.', // Empty LFG-high
    'Sorry, bub. Looks like they\'re already being space pirates on the Astral Plane.', // Empty LFG-epic
];

const CHARLOG = [
    'Nice try, turd.', // Someone is trying to mess with the guild fund
    'OH SHIT WE GOT A BADASS OVER HERE', // Someone is level 20
];

module.exports = {
    ASK : ASK,
    INVALID : INVALID,
    DOBIDDING : DOBIDDING,
    PING : PING,
    LFG : LFG,
    CHARLOG : CHARLOG,
}

module.exports.help = {
    name: 'personality'
}

function randColor() {
    return '#'+Math.floor(Math.random()*16777215).toString(16);
}