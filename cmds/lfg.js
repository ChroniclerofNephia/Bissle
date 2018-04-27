const funcs = module.require('../funcs.js');
const Discord = module.require('discord.js');
const sql = require('sqlite');
sql.open('./charlog.sqlite');

module.exports.run = async (bot, message, args) => {
    if (message.channel.type === 'dm') return;
    if (!message.member.roles.find("name", "Guild Member")) return message.author.send('You can only LFG if you are a registered Guild Member.')
    if (message.channel.name != 'lfg') return message.channel.send('Please LFG in ' + bot.channels.get('371684792988860417') + '.');
    if (args[1] && !['list', 'high', 'mid', 'low', 'add', 'remove', 'pbp'].includes(args[1]))
        return funcs.invalid(message);
    if (args[1]) { // Interpret specific lfg command
        var x = args[1].toLowerCase();
        if (x == 'list') message.channel.send(listlfg(message));
        else if (x == 'remove') removelfg(message);
        else if (x == 'add') {
            if (args[2]) addlfg(message, "LFG-"+args[2].toLowerCase());
            else addlfg(message, "LFG");
        }
        else if (x == 'high' || x == 'mid' || x == 'low' || x == 'pbp') {
            if(!message.member.roles.find("name", "LFG-"+x))
                addlfg(message, "LFG-"+x);
            else
                removelfg(message, args[1]);
        }
        else funcs.invalid(message);
    } else { // Toggle LFG
        if(!message.member.roles.find("name", "LFG")) {
            sql.get(`SELECT * FROM charlog WHERE userId ="${message.author.id}"`).then(row => {
                if (!row) return addlfg(message, "LFG");
                else {
                    if (row.level < 7) addlfg(message, "LFG-low");
                    else if (row.level < 13) addlfg(message, "LFG-mid");
                    else addlfg(message, "LFG-high");
                }
            }, err => {
                addlfg(message, "LFG");
            });
        }
        else removelfg(message);
    }
    message.delete();
}

module.exports.help = {
    name: 'lfg'
}

function addlfg(message, role) {
    if (role == "LFG-high" || role == "LFG-mid" || role == "LFG-low" || role == 'LFG-pbp')
        message.member.addRole(message.member.guild.roles.find("name", role));
    message.member.addRole(message.member.guild.roles.find("name", "LFG"));
    message.channel.send(message.author.toString() + " is LFG!");
}

function removelfg(message, tier='') {
    if (tier == 'low' || tier == 'mid' || tier == 'high' || tier == 'pbp')
        return message.member.removeRole(message.member.guild.roles.find("name", "LFG-"+tier));
    message.member.removeRole(message.member.guild.roles.find("name", "LFG-high"));
    message.member.removeRole(message.member.guild.roles.find("name", "LFG-mid"));
    message.member.removeRole(message.member.guild.roles.find("name", "LFG-low"));
    message.member.removeRole(message.member.guild.roles.find("name", "LFG-pbp"));
    message.member.removeRole(message.member.guild.roles.find("name", "LFG"));
    message.channel.send(message.author.toString() + " is no longer LFG.");
}

function toggleRole(message, role) {
    if (message.member.roles.find("name", role)) message.member.removeRole(message.member.guild.roles.find("name", role));
    else message.member.addRole(message.member.guild.roles.find("name", role));
}

function listlfg(message) {
    let lfglist = message.guild.roles.find("name", "LFG").members.map(m=>m.nickname);
    if (lfglist.length == 0) return 'Sorry, kid. Nobody\'s LFG.';
    let lfghigh = message.guild.roles.find("name", "LFG-high").members.map(m=>m.nickname);
    let lfgmid = message.guild.roles.find("name", "LFG-mid").members.map(m=>m.nickname);
    let lfglow = message.guild.roles.find("name", "LFG-low").members.map(m=>m.nickname);
    let lfgpbp = message.guild.roles.find("name", "LFG-pbp").members.map(m=>m.nickname);
    let listed = [];
    var embed = new Discord.RichEmbed()
        .setTitle('__Looking For Group__')
        .setColor(funcs.randColor());
    var title = '**High Tier** (Levels 13+)';
    if (lfghigh.length != 0) {
        let turds = '';
        for (twerp in lfghigh) {
            turds += lfghigh[twerp] + '\n';
            listed += lfghigh[twerp];
        }
        embed.addField(title, turds);
    } else embed.addField(title, 'Apparently they\'ve all been annihilated by spheres of varying sizes. Shame.');
    title = '**Mid Tier** (Levels 7-12)';
    if (lfgmid.length != 0) {
        let turds = '';
        for (twerp in lfgmid) {
            turds += lfgmid[twerp] + '\n';
            listed += lfgmid[twerp];
        }
        embed.addField(title, turds);
    } else embed.addField(title, "Too busy FTBing to LFG. Tell 'em to get a life and play D&D with you!");
    title = '**Low Tier** (Levels 2-6)';
    if (lfglow.length != 0) {
        let turds = '';
        for (twerp in lfglow) {
            turds += lfglow[twerp] + '\n';
            listed += lfglow[twerp];
        }
        embed.addField(title, turds);
    } else embed.addField(title, 'Weird. Need more meat for the grinder. Invite some friends!');
    var title = '**PBP Please**';
    if (lfgpbp.length != 0) {
        let turds = '';
        for (twerp in lfgpbp) {
            turds += lfgpbp[twerp] + '\n';
            listed += lfgpbp[twerp];
        }
        embed.addField(title, turds);
    } else embed.addField(title, 'Sorry, kid. Folks like their live games.');
    if (lfglist.length != 0) {
        title = '**Desperately LFG** (literally any level PLZ)';
        let turds = '';
        for (twerp in lfglist) if (!listed.includes(lfglist[twerp])) turds += lfglist[twerp] + '\n';
        if (turds != '') embed.addField(title, turds);
    }
    return embed;
}