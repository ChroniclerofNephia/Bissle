const funcs = module.require('../funcs.js');
const Discord = module.require('discord.js');
const fs = require('fs');
const sql = require('sqlite');
sql.open('./charlog.sqlite');

module.exports.run = async (bot, message, args) => {
    // CHECK PERMISSIONS
    if (message.channel.type === 'dm') return;
    if (!message.member.roles.find("name", "Guild Member")) return message.channel.send('You can only LFG if you are a registered Guild Member.')
    if (message.channel.name != 'lfg' && !funcs.testing(message)) return message.channel.send('Please LFG in ' + bot.channels.get('371684792988860417') + '.');
    
    if (!args[1]) { // TOGGLE
        if(!funcs.hasRole('LFG', message.member))
            sql.get(`SELECT * FROM charlog WHERE userId ="${message.author.id}"`).then(row => {
                if (!row) return message.channel.send("I sharted all over your file and can't add you to LFG.");
                if (row.level < 5) addlfg(bot, message, 'low');
                else if (row.level < 11) addlfg(bot, message, 'mid');
                else if (row.level < 17) addlfg(bot, message, 'high');
                else addlfg(bot, message, 'epic');
            }, err => {
                return message.channel.send("I sharted all over your file and can't add you to LFG.");
            });
        else removelfg(bot, message);
    }
    else switch(args[1].toLowerCase()) { // INTERPRET EXTRA COMMAND
        case 'list':
            message.channel.send(listlfg(bot, message));
            break;
        case 'epic':
        case 'high':
        case 'mid':
        case 'low':
        case 'pbp':
            toggle(bot, message, args[1].toLowerCase());
            break;
        case 'add':
            let gorp = 0;
            if (args[2]) gorp = args[2].toLowerCase();
            if (!args[2] || !(gorp == 'low' || gorp == 'mid' || gorp == 'high' || gorp == 'epic' || gorp == 'pbp'))
                sql.get(`SELECT * FROM charlog WHERE userId ="${message.author.id}"`).then(row => {
                    if (!row) return message.channel.send("I sharted all over your file and can't add you to LFG.");
                    if (row.level < 5) addlfg(bot, message, 'low');
                    else if (row.level < 11) addlfg(bot, message, 'mid');
                    else if (row.level < 17) addlfg(bot, message, 'high');
                    else addlfg(bot, message, 'epic');
                }, err => {
                    return message.channel.send("I sharted all over your file and can't add you to LFG.");
                });
            else addlfg(bot, message, gorp);
            break;
        case 'remove':
            removelfg(bot, message, args[2]);
            break;
        default:
            return funcs.invalid(message);
    }
    message.delete();
}

module.exports.help = {
    name: 'lfg'
}

function addlfg(bot, message, tier=null) {
    if (!tier || !(tier == 'low' || tier == 'mid' || tier == 'high' || tier == 'epic' || tier == 'pbp')) return message.channel.send('**OH Q@&%*#** One moment, I dropped all my lemons.');
    if (!funcs.hasRole('LFG', message.member)) // ADD LFG, AND APPROPRIATE TIER
        bot.lfg[message.member.id] = {
            name: message.member.nickname || '<@!'+message.member.id+'>',
            guild: message.guild.id,
            time: Date.now(),
            low: tier == 'low',
            mid: tier == 'mid',
            high: tier == 'high',
            epic: tier == 'epic',
            pbp: tier == 'pbp',
        }
    else { // SPECIFIED TIER ONLY
        bot.lfg[message.member.id] = {
            name: message.member.nickname || '<@!'+m.id+'>',
            guild: message.guild.id,
            time: bot.lfg[message.member.id].time,
            low: bot.lfg[message.member.id].low || tier == 'low',
            mid: bot.lfg[message.member.id].mid || tier == 'mid',
            high: bot.lfg[message.member.id].high || tier == 'high',
            epic: bot.lfg[message.member.id].epic || tier == 'epic',
            pbp: bot.lfg[message.member.id].pbp || tier == 'pbp',
        }
    }

    let role = message.guild.roles.find('name', 'LFG-'+tier);
    message.member.addRole(role);
    if (!funcs.hasRole('LFG', message.member)) {
        role = message.guild.roles.find('name', 'LFG');
        message.member.addRole(role);
    }

    fs.writeFile('./lfg.json', JSON.stringify(bot.lfg, null, 4), err => {
        if (err) throw err;
    });

    message.channel.send(message.author.toString() + " is LFG for a " + (tier == 'pbp' ? "PBP" : tier+"-level") + " game.");
}

function removelfg(bot, message, tier=null) {
    let role = message.guild.roles.find('name', 'LFG' + (!tier ? '' : '-'+tier));
    if (!role || !message.member.roles.has(role.id))
        return funcs.invalid(message);

    if (!tier || !bot.lfg[message.member.id]) { // TURN EVERYTHING OFF
        message.member.removeRole(message.member.guild.roles.find("name", "LFG-epic"));
        message.member.removeRole(message.member.guild.roles.find("name", "LFG-high"));
        message.member.removeRole(message.member.guild.roles.find("name", "LFG-mid"));
        message.member.removeRole(message.member.guild.roles.find("name", "LFG-low"));
        message.member.removeRole(message.member.guild.roles.find("name", "LFG-pbp"));
        message.member.removeRole(role);
        if (bot.lfg[message.member.id]) delete bot.lfg[message.member.id];
        message.channel.send(message.author.toString() + " is no longer LFG.");
    }
    else { // OR TURN ONE THING OFF
        message.member.removeRole(role);
        let stuff = [bot.lfg[message.member.id].time, bot.lfg[message.member.id].low, bot.lfg[message.member.id].mid, bot.lfg[message.member.id].high, bot.lfg[message.member.id].epic, bot.lfg[message.member.id].pbp];
        delete bot.lfg[message.member.id];
        bot.lfg[message.member.id] = {
            name: message.member.nickname || '<@!'+m.id+'>',
            guild: message.guild.id,
            time: stuff[0],
            low: stuff[1] && tier != 'low',
            mid: stuff[2] && tier != 'mid',
            high: stuff[3] && tier != 'high',
            epic: stuff[4] && tier != 'epic',
            pbp: stuff[5] && tier != 'pbp',
        }
        let q = bot.lfg[message.member.id]
        if (!q.epic && !q.high && !q.mid && !q.low && !q.pbp) {
            delete bot.lfg[message.member.id];
            message.member.removeRole(message.member.guild.roles.find("name", "LFG"));
            message.channel.send(message.author.toString() + " is no longer LFG.");
        } else message.channel.send(message.author.toString() + " is no longer LFG for a " + (tier == 'pbp' ? "PBP" : tier+"-level") + " game.");
    }

    fs.writeFile('./lfg.json', JSON.stringify(bot.lfg), err => {
        if (err) throw err;
    });
}

function toggle(bot, message, tier=null) {
    if (!tier) return funcs.invalid(message);
    if (message.member.roles.find("name", 'LFG-'+tier)) removelfg(bot, message, tier);
    else addlfg(bot, message, tier);
}

function listlfg(bot, message) {
    let lfg = bot.lfg;
    let lfgepic = []; let lfghigh = []; let lfgmid = []; let lfglow = []; let lfgpbp = []; let twerp;
    for (i in lfg) { // ASSEMBLE NAMES AND WAITS
        let wait = Date.now() - lfg[i].time;
        twerp = lfg[i].name + (wait > 86400000 ? ': ' + Math.floor(wait/86400000) + ' DAY' + (Math.floor(wait/86400000) > 1 ? 'S' : '') + ' LFG' : '' );
        if (lfg[i].pbp) lfgpbp.push([wait, twerp]);
        if (lfg[i].low) lfglow.push([wait, twerp]);
        if (lfg[i].mid) lfgmid.push([wait, twerp]);
        if (lfg[i].high) lfghigh.push([wait, twerp]);
        if (!lfg[i].epic) continue;
        else lfgepic.push([wait, twerp]);
    }

    var embed = new Discord.RichEmbed()
        .setTitle('__Looking For Group__')
        .setColor(funcs.randColor());

    var title = '**PBP PLIX**';
    if (lfgpbp.length != 0) {
        let turds = '';
        lfgpbp.sort(function (a,b) {
            return a[0] - b[0];
        });
        for (turd in lfgpbp) turds += lfgpbp[turd][1] + '\n';
        embed.addField(title, turds);
    } else embed.addField(title, 'Sorry, kid. Folks like their live games.');

    title = '**Low Tier** (Levels 2-4)';
    if (lfglow.length != 0) {
        let turds = '';
        lfglow.sort(function (a,b) {
            return a[0] - b[0];
        });
        for (turd in lfglow) turds += lfglow[turd][1] + '\n';
        embed.addField(title, turds);
    } else embed.addField(title, "Weird. Need more meat for the grinder. Invite some friends!");

    title = '**Mid Tier** (Levels 5-10)';
    if (lfgmid.length != 0) {
        let turds = '';
        lfgmid.sort(function (a,b) {
            return a[0] - b[0];
        });
        for (turd in lfgmid) turds += lfgmid[turd][1] + '\n';
        embed.addField(title, turds);
    } else embed.addField(title, 'Too busy FTBing to LFG. Tell \'em to get a life and play D&D with you!');

    var title = '**High Tier** (Levels 11-16)';
    if (lfghigh.length != 0) {
        let turds = '';
        lfghigh.sort(function (a,b) {
            return a[0] - b[0];
        });
        for (turd in lfghigh) turds += lfghigh[turd][1] + '\n';
        embed.addField(title, turds);
    } else embed.addField(title, 'Apparently they\'ve all been annihilated by spheres of varying sizes. Shame.');

    var title = '**Epic Tier** (Levels 17+)';
    if (lfgepic.length != 0) {
        let turds = '';
        lfgepic.sort(function (a,b) {
            return a[0] - b[0];
        });
        for (turd in lfgepic) turds += lfgepic[turd][1] + '\n';
        embed.addField(title, turds);
    } else embed.addField(title, 'Sorry, bub. Looks like they\'re already being space pirates on the Astral Plane.');

    return embed;
}