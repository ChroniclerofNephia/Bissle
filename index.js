const Discord = require("discord.js");
const settings = require("./botsettings.json");
const fs = require('fs');

const PREFIX = settings.prefix;
var nonsenseModeEnabled = false; var alphaLet = 6;

const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();

fs.readdir("./cmds/", (err, files) => {
    if(err) console.error(err);

    let jsfiles = files.filter(f => f.split('.').pop() === 'js');
    if (jsfiles.length <= 0) return console.log('No commands to load.');

    console.log('Loading ' + jsfiles.length + ' commands...');

    jsfiles.forEach((f, i) => {
        let props = require('./cmds/'+f);
        console.log((i+1)+': '+ f +' loaded!');
        bot.commands.set(props.help.name, props);
    });
    console.log('All commands locked and loaded.');
});

bot.on("ready", async () => {
    console.log("Bissle is ready to rumble!");
});

/**bot.on("guildMemberAdd", function (member) {
    member.guild.channels.find("name", "gate-of-arrival").send("Yo waddap, it's dat " + member.toString());
});**/

bot.on("message", async (message) => {
    if (message.author.equals(bot.user)) return;
    if (nonsenseModeEnabled) {
        autoBoop(message);
        alphabet(message);
    }
    if (!message.content.startsWith(PREFIX)) return;

    let args = message.content.substring(PREFIX.length).split(" ");
    let cmd = bot.commands.get(args[0].toLowerCase());
    if (cmd) cmd.run(bot, message, args);
    else
        switch (args[0].toLowerCase()) {
            case "r":
            case "rr":
                bot.commands.get('dice').run(bot, message, args);
                break;
            /**case "dm":
                if (args[1]) {
                    if (args[1].toLowerCase() == 'list') {
                        message.channel.send('Feature not yet implemented.');
                    } else message.channel.send(invalid(message));
                } else {
                    message.delete();
                    if (!message.member.roles.find("name", 'Available to DM'))
                        message.channel.send(message.author.toString() + " is ready to DM!");
                    else message.channel.send(message.author.toString() + " is no longer available to DM.");
                    toggleRole(message, 'Available to DM');
                }
                break;**/
            case "commands":
                message.channel.send(commandList());
                break;
            case "command":
                message.channel.send(commandList());
                break;
            // v-UNDER CONSTRUCTION-v
            case "help":
                message.channel.send("Reply ,commands to get a list of the words I'll actually listen to.");
                break;
            case "ping":
                message.channel.send(ping(message));
                break;
            case "dobidding":
                if (isNorrick(message)) {
                    message.delete();
                    message.channel.send(dobidding(message));
                } else invalid(message);
                break;
            case "invalid":
                if (isNorrick(message)) {
                    message.delete();
                    message.channel.send(invalid(message));
                }
                break;
            case "nonsense":
                if (isNorrick) {
                    message.delete();
                    if(nonsenseModeEnabled) message.channel.send('**NONSENSE MODE ENABLED**: Prepare loins for maximum nonsense.');
                    else message.channel.send('on');
                    nonsenseModeEnabled = !nonsenseModeEnabled;
                } else message.channel.send(invalid(message));
                break;
            default: message.channel.send(invalid(message));
        }
});

function commandList() {
    return new Discord.RichEmbed().addField("**Bissle Commands**",
    "**"+PREFIX +"lfg** - Toggles 'LFG' role. Add **high**, **mid**, or **low** to specify desired party level.\n" +
    "        (i.e. **"+PREFIX+"lfg high** for plane-hopping shenanigans)\n" +
    "        Use **"+PREFIX+"lfg list** to get all members currently LFG.\n" +
    //"**"+PREFIX +"dm** - Toggles 'Available to DM' role.\n" +
    "**"+PREFIX +"r** - Rolls dice. Supports keep, drop, reroll, exploding dice, high/low selectors.\n" +
    "        (i.e. **"+PREFIX+"r 4d6kh3+3d20dl1-14*1d100ro1/2d4rr1+2d10e10 sick** is valid.)\n" +
    "        Use **"+PREFIX+"rr** to roll several iterations. (i.e. **"+PREFIX+"rr 6 4d6kh3** for stats)\n" +
    "**"+PREFIX +"ask** - Ask Bissle a yes/no question, and he will answer.\n" +
    "**"+PREFIX +"joke** - Make Bissle tell you a joke.\n" +
    "**"+PREFIX +"ping** - Ping Bissle for testing purposes.\n")
    .setFooter("More functionality will be added as Loreseeker Norrick sees fit.")
    .setColor(randColor());
}

function ping(message) {
    var pings = [
        "Don't f@%$ing ping me, you d&*#s@#&&%er!",
        "You know pings are just a cry for help.",
        "I bet this is really fun for you isn't it.",
        "...",
        "Please stop.",
        "(╯°□°）╯︵ ┻━┻",
        new Discord.RichEmbed().setColor(randColor())
            .setImage('http://gifimage.net/wp-content/uploads/2017/07/critical-role-gif-6.gif'),
        new Discord.RichEmbed().setColor(randColor())
            .setImage('https://i.giphy.com/media/3o7WTAWQI5G3Xmym88/giphy.webp'),
        new Discord.RichEmbed().setColor(randColor())
            .setImage('https://i.imgur.com/QUfjucN.gif'),
        new Discord.RichEmbed().setColor(randColor())
            .setImage('https://media0.giphy.com/media/xUPGcKbFxXKsmeEZpu/giphy-downsized.gif'),
            
    ]
    var x = Math.floor(Math.random()*(pings.length+1));
    if (x == pings.length) {
        if (Math.random() > 0.5) message.react(bot.emojis.find("name", "banhammer"));
        else message.react(bot.emojis.find("name", "blackflare"));
        return;
    }
    return pings[x];
}

function randColor() {
    return '#'+Math.floor(Math.random()*16777215).toString(16);
}

function invalid(message) {
    var responses = [
        "Speak up, kiddo! I didn't understand a word you said.",
        "WHAT DID YOU CALL ME YOU LITTLE TWERP?!",
        "That didn't make a lick of sense.",
        "Sorry, I don't speak abyssal.",
        "Sorry, " + message.author.toString() + ". I don't know what the fuck that means.",
        new Discord.RichEmbed().setImage('https://i.imgur.com/6DN4q4L.gif').setColor(randColor()),
    ];
    let x = Math.floor(Math.random()*(responses.length+1));
    if (x == responses.length) {
        var c = 10;
        var interval = setInterval (function () {
            // use the message's channel (TextChannel) to send a new message
            if (c == 10) {
                message.channel.send('**SERVER RESET IN T-MINUS 10...**');
                c--;
            }
            message.channel.send('**'+c--+'...**')
            .catch(console.error); // add error handling here
            if (c == 0) {
                clearInterval(interval);
                return;
            }
        }, 1000);
    }
    return responses[x];
}

function dobidding(message) {
    var responses = [
        "***Bissle will remember that.***",
        "I'll be reporting this.",
        "*takes notes vigorously*",
        "*hefts hand-me-down banhammer*\nYou wanna play? Let's play.",
    ]
    return responses[Math.floor(Math.random()*responses.length)];
}

function autoBoop(message) {
    if (message.member.roles.find("name", 'Prude')) {
        message.react(bot.emojis.find("name", "boop"));
        return;
    }
}

function alphabet(message) {
    if (message.member.roles.find("name", 'BUTTHEAD TWERKER')) {
        let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        message.member.setNickname(alphabet[alphaLet++]).catch(function(error) {
            console.log(error);
        });
        console.log(message.member.nickname);
        alphaLet = alphaLet%26;
        return;
    }
}

function isNorrick(message) {
    return (message.member.nickname == 'Loreseeker Norrick') && message.member.roles.find("name" , "Admins");
}

bot.login(settings.token);
