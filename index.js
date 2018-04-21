const Discord = require("discord.js");
const settings = require("./botsettings.json");
const funcs = module.require('./funcs.js');
const fs = require('fs');

const PREFIX = settings.prefix;
var nonsenseModeEnabled = false; var alphaLet = 6;

const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();
bot.mutes = require('./mutes.json');
bot.bank = require('./bank.json');

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
        alphabet(message);
    }
    if (message.author.equals(bot.user)) return;
    if (!message.content.startsWith(PREFIX)) return;

    let args = message.content.substring(PREFIX.length).split(" ");
    for (let arg in args) while (args[arg] == '') args.splice(arg, 1);
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
            case 'list':
                bot.commands.get('lfg').run(bot, message, ['lfg', 'list']);
                break;
            case "commands":
            case "command":
                message.channel.send(commandList());
                break;
            // v-UNDER CONSTRUCTION-v
            case "help":
                message.channel.send("Reply ,commands to get a list of the words I'll actually listen to.");
                break;
            case "charinfo":
            case "reward":
            case "initiate":
            case "retire":
                bot.commands.get('charlog').run(bot, message, args);
                break;
            case "dobidding":
                if (funcs.isNorrick(message)) {
                    message.delete();
                    message.channel.send(dobidding(message));
                } else funcs.invalid(message);
                break;
            case "nonsense":
                if (funcs.isNorrick(message)) {
                    message.delete();
                    if(nonsenseModeEnabled) message.channel.send('**NONSENSE MODE DISABLED**: Boring normality stabilized.');
                    else message.channel.send('**NONSENSE MODE ENABLED**: Prepare loins for maximum nonsense.');
                    nonsenseModeEnabled = !nonsenseModeEnabled;
                } else funcs.invalid(message);
                break;
            
            case "invalid":
                if (!isNorrick(message)) break;
                message.delete();
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
    if (message.member.roles.find("name", 'BUTTHEAD TWERKER') && message.member.roles.find("name", 'Balance DM')) {
        let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        message.member.setNickname(alphabet[alphaLet++]).catch(function(error) {
            console.log(error);
        });
        console.log(message.member.nickname);
        alphaLet = alphaLet%26;
        return;
    }
}

bot.login(settings.token);