const Discord = require("discord.js");
const settings = require("./botsettings.json");
const funcs = module.require('./funcs.js');
const fs = require('fs');

const cmd_desc = require('./cmd_desc.json');
const PREFIX = settings.prefix;
var nonsenseModeEnabled = false; var alphaLet = 6; var prevNick = 'Mix-Master ICE';

const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();
bot.mutes = require('./mutes.json');
bot.lfg = require('./lfg.json');
bot.inventory = require('./inventory.json');


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

    bot.setInterval(() => { // Check mute timer
        for (let i in bot.mutes) {
            let time = bot.mutes[i].time;
            let guildId = bot.mutes[i].guild;
            let guild = bot.guilds.get(guildId);
            let member = guild.members.get(i);
            let role = guild.roles.find(r => r.name === 'Silenced');
            if (!role || !guild) continue;

            if (Date.now() > time) { // Time's up!
                member.removeRole(role);
                delete bot.mutes[i];

                fs.writeFile('./mutes.json', JSON.stringify(bot.mutes), err => {
                    if (err) throw err;
                    console.log('The Silence on ' + member.toString() + ' has been dispelled!');
                });
            }
        }
    }, 5000)
});

/**bot.on("guildMemberAdd", function (member) {
    member.guild.channels.find("name", "gate-of-arrival").send("Yo waddap, it's dat " + member.toString());
});**/

bot.on("message", async (message) => {
    if (nonsenseModeEnabled) {
        autoBoop(message);
        /* alphabet(message); */
        tag(message);
    }
    if (message.author.equals(bot.user)) return;
    if (!message.content.startsWith(PREFIX)) return;

    let args = message.content.substring(PREFIX.length).split(" ");
    for (let arg in args) while (args[arg] == '') args.splice(arg, 1);
    if (!args[0]) return;
    let good = funcs.hasPermission(args[0].toLowerCase(), message);
    if (!good && !funcs.testing(message)) return funcs.invalid(message);
    let cmd = bot.commands.get(args[0].toLowerCase());
    if (cmd) cmd.run(bot, message, args);
    else
        switch (args[0].toLowerCase()) {
            case "rr":
            case "r":
                bot.commands.get('dice').run(bot, message, args);
                break;
            case "commands":
            case "command":
                message.channel.send(funcs.commandList(message));
                break;
            // CHARLOG BLOCK
            case 'dmrewards':
                args.shift();
                bot.commands.get('charlog').run(bot, message, ['dmreward'].concat(args));
            case 'rewards':
                args.shift();
                bot.commands.get('charlog').run(bot, message, ['reward'].concat(args));
            case 'headcount':
            case 'donate':
            case "adjust":
            case "wipe":
            case "initiate":
            case "retire":
            case "transfer":
            case "sell":
            case "spend":
            case "charinfo":
            case "dmreward":
            case "reward":
                bot.commands.get('charlog').run(bot, message, args);
                break;
            // NEW STUFF
            case "auction":
                bot.commands.get('charlog').run(bot, message, args);
                break;
            case "buy":
                bot.commands.get('inventory').run(bot, message, ['inventory'].concat(args));
                break;
            // ADMIN ONLY
            case "dobidding":
                if (message.channel.type != 'dm') message.delete();
                message.channel.send(dobidding(message));
                break;
            case "nonsense":
                message.delete();
                if (message.channel.name != 'general-ooc' && !funcs.testing(message)) return message.channel.send("Nonsense mode can only be activated from " + message.guild.channels.find('name', 'general-ooc') + '.');
                if(nonsenseModeEnabled) message.channel.send('**NONSENSE MODE DISABLED**: Boring normality stabilized.');
                else message.channel.send('**NONSENSE MODE ENABLED**: Prepare loins for maximum nonsense.');
                nonsenseModeEnabled = !nonsenseModeEnabled;
                break;
            case "test":
                funcs.testmode(message);
                break;
            case "reset":
                if (!funcs.hasPermission('dobidding', message)) return funcs.invalid(message);
                reset(message);
                break;
            case "testo":
                console.log(message.author.id);
                break;
            default: funcs.invalid(message);
        }
});

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
    if (message.channel.name == 'general-ooc') {
        message.react(bot.emojis.find("name", "boop"));
        return;
    }
}

function alphabet(message) {
    if (message.member.id == '123675155032440832') { // G only
        let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        message.member.setNickname(alphabet[alphaLet++]).catch(function(error) {
            console.log(error);
        });
        alphaLet = alphaLet%26;
        return;
    }
}

function tag(message) {
    if (message.channel.name != 'general-ooc') return;
    if (message.member.roles.find('name', 'Admins')) return;
    let swap = message.member.nickname;
    message.member.setNickname(prevNick).catch(function(error) {
        console.log(error);
    });
    prevNick = swap;
    console.log('SWAPPED');
}

function reset(message) {
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
}

bot.login(settings.token);