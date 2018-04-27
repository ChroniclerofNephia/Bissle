const Discord = require("discord.js");
const settings = require("./botsettings.json");
const funcs = module.require('./funcs.js');
const fs = require('fs');

const PREFIX = settings.prefix;
var nonsenseModeEnabled = false; var alphaLet = 6; var prevNick = 'Mix-Master ICE';

const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();
bot.mutes = require('./mutes.json');
bot.cmd_desc = require('./cmd_desc.json');

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
    let good = funcs.hasPermission(args[0].toLowerCase(), message.member)
    if (!good) return funcs.invalid(message);
    let cmd = bot.commands.get(args[0].toLowerCase());
    if (cmd) cmd.run(bot, message, args);
    else
        switch (args[0].toLowerCase()) {
            case "rr":
            case "r":
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
            case "command":
                message.channel.send(commandList());
                // bot.commands.get('help').run(bot, message, ['help', 'commands']);
                break;
            // CHARLOG BLOCK
            case "adjust":
            case "wipe":
            case "initiate":
            case "retire":
            case "transfer":
            case "spend":
            case "charinfo":
            case "dmreward":
            case "reward":
                bot.commands.get('charlog').run(bot, message, args);
                break;
            // NORRICK ONLY
            case "dobidding":
                message.delete();
                message.channel.send(dobidding(message));
                break;
            case "nonsense":
                message.delete();
                if (message.channel.name != 'general-ooc') return message.channel.send("Nonsense mode can only be activated from " + message.guild.channels.find('name', 'general-ooc') + '.');
                if(nonsenseModeEnabled) message.channel.send('**NONSENSE MODE DISABLED**: Boring normality stabilized.');
                else message.channel.send('**NONSENSE MODE ENABLED**: Prepare loins for maximum nonsense.');
                nonsenseModeEnabled = !nonsenseModeEnabled;
                break;
            case "testo":
                for (i in bot.cmd_desc) {console.log(i); console.log(bot.cmd_desc[i]);}
                break;
            default: funcs.invalid(message);
        }
});

function commandList() {
    return new Discord.RichEmbed().addField("**Bissle Commands**",
    "**"+PREFIX +"lfg** - Toggles 'LFG' role. Add **high**, **mid**, **low**, or **pbp** to specify game type.\n" +
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
    .setColor(funcs.randColor());
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

bot.login(settings.token);