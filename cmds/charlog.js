const funcs = module.require('../funcs.js');
const sql = require('sqlite');
sql.open('./charlog.sqlite');

const thresholds = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];

module.exports.run = async (bot, message, args) => {
    if (args[0] == 'charlog') return funcs.invalid(message);

    switch (args[0]) {
        case 'charinfo':
            let target = message.author;
            if (isGM(message.member)) target = message.mentions.users.first() || message.author;
            sql.get(`SELECT * FROM charlog WHERE userId ="${target.id}"`).then(row => {
                if (!row) return message.channel.send("According to my records, " + ( target.id == message.author.id ? 'you are' : 'this person is' ) + " not a member of our guild.");
                message.channel.send('__**' + row.name + '**__' +
                    '\n**Level:** ' + row.level +
                    '\n**XP:** ' + row.xp + ' XP. (' + (thresholds[row.level] - row.xp) + ' XP til Level ' + (row.level+1) + ')' +
                    '\n**TP:** ' + row.tp + ' TP' +
                    '\n**Wealth:** ' + row.gp + ' GP');
            }, err => {
                message.channel.send("My files show that the Heroes Guild of Remnant is completely devoid of adventurers. Weird!");
            });
            break;
        case 'spend':
            if (isNaN(args[1]) || parseInt(args[1]) <= 0) return message.channel.send('Please specify a valid number.');
            if (!args[2]) return message.channel.send('Please specify whether you are spending gp or tp.');
            let stype = args[2].toLowerCase();
            if (!(stype == 'gp' || stype == 'tp')) return message.channel.send('You can only spend gp or tp. NOT ' + args[2].toUpperCase() + '!');
            if (!args[3]) return message.channel.send('Please specify what you intend to spend your ' + stype + ' on.');
            let samt = parseInt(args[1]);
            for (i = 0; i < 3; i++) args.shift();
            let sacquisition = args.join(' ');
            sql.get(`SELECT * FROM charlog WHERE userId ="${message.author.id}"`).then(row => {
                if (!row) message.channel.send('https://www.youtube.com/watch?v=n5diMImYIIA');
                else { // Reward and confirm
                    switch(stype) {
                        case 'gp':
                            if (samt > row.gp) message.channel.send("You cannot spend more " + stype + " than you have.");
                            else {
                                message.channel.send(message.author.toString() + ' has spent ' + samt + ' GP on ' + sacquisition + '.' +
                                    '\n**New GP Total:** ' + (row.gp - samt) + ' gp');
                                sql.run(`UPDATE charlog SET gp = ${row.gp - samt} WHERE userId = ${message.author.id}`);
                            }
                            break;
                        case 'tp':
                            if (samt > row.tp) message.channel.send("You cannot spend more " + stype + " than you have.");
                            else {
                                message.channel.send(message.author.toString() + ' has spent ' + amt + ' TP on ' + sacquisition + '.' +
                                    '\n**New TP Total:** ' + (row.tp - samt) + ' gp');
                                sql.run(`UPDATE charlog SET tp = ${row.tp - samt} WHERE userId = ${message.author.id}`);
                            }
                            break;
                    }
                }
            }, err => {
                message.channel.send("Can't reward anybody when I haven't got files for 'em!");
            });
            break;
        case 'reward':
            if (!isGM(message.member)) return message.channel.send('You cannot give rewards because you are not a GM.');
            if (isNaN(args[1]) || parseInt(args[1]) <= 0) return message.channel.send('Please specify a valid number.');
            if (!args[2]) return message.channel.send('Please specify reward type.');
            let output;
            let rtype = args[2].toLowerCase();
            if (!(rtype == 'xp' || rtype == 'gp' || rtype == 'tp')) return message.channel.send('Please specify reward type.');
            let recipients = message.mentions.users;
            if (!recipients) return message.channel.send('Please specify at least one recipient.')
            message.channel.send('__**REWARDS**__');
            recipients.forEach(recipient => {
                if (recipient.id == message.author.id && !funcs.isNorrick(message)) {
                    message.channel.send('You cannot reward yourself.');
                }
                else sql.get(`SELECT * FROM charlog WHERE userId ="${recipient.id}"`).then(row => {
                    if (!row) message.channel.send(recipient.toString() + ' has not yet been initiated. Cannot process reward paperwork.');
                    else { // Reward and confirm
                        let amt = parseInt(args[1]);
                        switch(rtype) {
                            case 'xp':
                                message.channel.send(recipient.toString() + ' has been awarded ' + args[1] + ' XP.');
                                let increase = 0;
                                for (i = 0; row.xp + amt >= thresholds[row.level+i]; i++) increase++;
                                if (increase > 1) message.guild.channels.find("name", "the-hexagon").send(recipient.toString() + " has leveled up more than once. **Check that shit!**");
                                if (increase > 0) message.channel.send('__**CONGRATULATIONS, ' + row.name.toUpperCase() + '!**__\nYou are now level **' + (row.level+increase) + '**!\n' +
                                    bot.emojis.find("name", "praise") + bot.emojis.find("name", "disgust") + bot.emojis.find("name", "SweatSouls") + bot.emojis.find("name", "nat20"));
                                sql.run(`UPDATE charlog SET level = ${row.level + increase} WHERE userId = ${recipient.id}`);
                                sql.run(`UPDATE charlog SET xp = ${row.xp + amt} WHERE userId = ${recipient.id}`);
                                break;
                            case 'gp':
                                message.channel.send(recipient.toString() + ' has been awarded ' + args[1] + ' GP.');
                                sql.run(`UPDATE charlog SET gp = ${row.gp + amt} WHERE userId = ${recipient.id}`);
                                break;
                            case 'tp':
                                message.channel.send(recipient.toString() + ' has been awarded ' + args[1] + ' TP.');
                                sql.run(`UPDATE charlog SET tp = ${row.tp + amt} WHERE userId = ${recipient.id}`);
                                break;
                        }
                    }
                });
            });
            message.channel.send('[DM REWARDS GO HERE]');
            break;
        case 'transfer':
            if (isNaN(args[1]) || parseInt(args[1]) <= 0) return message.channel.send('Please specify a valid number.');
            let trecipient = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[2]));
            if (!trecipient) return message.channel.send('Please specify who you intend to transfer gp to.');
            if (trecipient.id == message.author.id) message.channel.send("Fuck off and quit wasting my time!");
            let tamt = parseInt(args[1]);
            sql.get(`SELECT * FROM charlog WHERE userId ="${message.author.id}"`).then(row => {
                if (!row) message.channel.send("We haven't got a file for you, kid. You need to be initiated into the guild before you can transfer cash to a hero.");
                else {
                    if (tamt > row.gp) message.channel.send("You cannot spend more gp than you have.");
                    else {
                        sql.get(`SELECT * FROM charlog WHERE userId ="${trecipient.id}"`).then(row2 => {
                            message.channel.send(message.author.toString() + ' has transfered ' + tamt + ' GP to ' + trecipient.toString() + '.');
                            sql.run(`UPDATE charlog SET gp = ${row.gp - tamt} WHERE userId = ${message.author.id}`);
                            sql.run(`UPDATE charlog SET gp = ${row2.gp + tamt} WHERE userId = ${trecipient.id}`);
                        }, err2 => {
                            message.channel.send("Can't transfer gold to someone I haven't got files for!");
                        });
                    }
                }
            }, err => {
                message.channel.send("Sorry, I lost your bank account.");
            });
            break;
        case 'initiate':
            let initiat = message.guild.member(message.mentions.users.first()) || message.member;
            sql.get('SELECT * FROM charlog WHERE userId = ' + initiat.id).then(row => {
                initiate (sql, message, args, row, initiat);
            }).catch(() => {
                sql.run('CREATE TABLE IF NOT EXISTS charlog (userId TEXT, name, level INTEGER, xp INTEGER, gp INTEGER, tp INTEGER)').then(row => {
                    initiate (sql, message, args, row, initiat);
                })
            });
            break;
        case 'retire':
            sql.get(`SELECT * FROM charlog WHERE userId ="${message.author.id}"`).then(row => {
                if (!row) return message.channel.send("According to my records, you are not a member of our guild.");
                else {
                    message.channel.send(message.author.toString() + '\n' + row.name + ' has retired from the Heroes Guild of Remnant.');
                    sql.run(`DELETE FROM charlog WHERE userId ="${message.author.id}"`);
                }
            }, err => {
                message.channel.send("My file cabinet has been swallowed by a portal into the astral plane. Need a new one!");
            });
            break;
        case 'wipe':
            if (!funcs.isNorrick(message)) return funcs.invalid(message);
            sql.run('DROP TABLE IF EXISTS charlog');
            console.log('CHARLOG DELETED');
            break;
        case 'adjust':
            if (!message.member.roles.find('name', 'Admins')) return message.channel.send('You cannot adjust rewards because you are not an admin.');
            if (isNaN(args[1]) || parseInt(args[1]) == 0) return message.channel.send('Please specify a valid number.');
            if (!args[2]) return message.channel.send('Please specify reward type.');
            let atype = args[2].toLowerCase();
            if (!(atype == 'xp' || atype == 'gp' || atype == 'tp')) return message.channel.send('Please specify value to adjust (xp, tp or gp).');
            let adjustees = message.mentions.users;
            if (!adjustees) message.channel.send('Please specify for whom you wish to adjust ' + atype + ' value.');
            adjustees.forEach(recipient => {
                if (recipient.id == message.author.id) {
                    message.channel.send('You cannot adjust your own ' + atype + '.');
                }
                else sql.get(`SELECT * FROM charlog WHERE userId ="${recipient.id}"`).then(row => {
                    if (!row) message.channel.send(recipient.toString() + ' has not yet been initiated. Cannot process reward paperwork.');
                    else { // Reward and confirm
                        let amt = parseInt(args[1]);
                        switch(atype.toLowerCase()) {
                            case 'xp':
                                if (row.xp + amt < 0) message.channel.send('You cannot cause someone to have less than 0 ' + args[2] + '.');
                                else {
                                    let output = recipient.toString() + ' has been ' + (amt > 0 ? 'awarded an additional ' : 'deducted ' ) + Math.abs(amt) + ' XP.' +
                                        '\n**New XP Total:** ' + (row.xp + amt);
                                    let change = 0;
                                    for (i = 0; row.xp + amt >= thresholds[row.level+i]; i++) change++;
                                    for (i = 0; row.xp + amt < thresholds[row.level-1+i]; i--) change--;
                                    output = (change != 0 ? '\n' + '__**CONGRATULATIONS**__' + '\n' + output + '\nYou are now level **' + (row.level+change) + '**!\n' +
                                        bot.emojis.find("name", "praise") + bot.emojis.find("name", "disgust") + bot.emojis.find("name", "SweatSouls") + bot.emojis.find("name", "nat20") : output);
                                    message.channel.send(output);
                                    sql.run(`UPDATE charlog SET level = ${row.level + change} WHERE userId = ${recipient.id}`);
                                    sql.run(`UPDATE charlog SET xp = ${row.xp + amt} WHERE userId = ${recipient.id}`);
                                }
                                break;
                            case 'gp':
                                if (row.gp + amt < 0) message.channel.send('You cannot cause someone to have less than 0 ' + args[2] + '.');
                                else {
                                    message.channel.send(recipient.toString() + ' has been ' + (amt > 0 ? 'awarded an additional ' : 'deducted ' ) + Math.abs(amt) + ' GP.' +
                                        '\n**New GP Total:** ' + (row.gp + amt) + ' gp');
                                    sql.run(`UPDATE charlog SET gp = ${row.gp + amt} WHERE userId = ${recipient.id}`);
                                }
                                break;
                            case 'tp':
                                if (row.tp + amt < 0) message.channel.send('You cannot cause someone to have less than 0 ' + args[2] + '.');
                                else {
                                    message.channel.send(recipient.toString() + ' has been ' + (amt > 0 ? 'awarded an additional ' : 'deducted ' ) + Math.abs(amt) + ' TP.' +
                                        '\n**New TP Total:** ' + (row.tp + amt));
                                    sql.run(`UPDATE charlog SET tp = ${row.tp + amt} WHERE userId = ${recipient.id}`);
                                }
                                break;
                        }
                    }
                }, err => {
                    message.channel.send("Can't nerf anybody when I haven't got files for 'em!");
                });
            });
            break;
        default:
            return funcs.invalid(message);
    }
}

module.exports.help = {
    name: 'charlog'
}

function initiate (sql, message, args, row, initiat) {
    if (!row.name) { // No character logged. INITIATE!
        if (!args[1]) return message.channel.send('Initiate who?'); // If no name given
        if (initiat.id != message.author.id || args[args.length-1] == '<@!' + message.author.id + '>') args.pop();
        if (!args[1]) return message.channel.send('Please reenter this command as follows:\n' +
            ',initiate [CORRECTLY-SPELLED ADVENTURER NAME] [DISCORD TAG]'); // If improper format
        args.shift();
        let charname = args.join(' ');
        message.channel.send(initiat.toString() + '\nWelcome to the Heroes Guild of Remnant, ' + charname + '!');
        sql.run("INSERT INTO charlog (userId, name, level, xp, gp, tp) VALUES (?, ?, ?, ?, ?, ?)", [initiat.id, charname, 2, 300, 0, 0]);
        initiat.addRole(message.guild.roles.find(r => r.name === 'Guild Member'));
    } else return message.channel.send((initiat.id == message.author.id ? 'You must retire your current adventurer before you can initiate a new one.' : 'This person\'s current adventurer must retire before they can initiate a new one.'));
}

function isGM(boi) {
    return boi.roles.find('name', 'GM') || boi.roles.find('name', 'Staff');
}