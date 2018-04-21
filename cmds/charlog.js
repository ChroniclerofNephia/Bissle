const funcs = module.require('../funcs.js');
const sql = require('sqlite');
sql.open('./charlog.sqlite');

const threshholds = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];

module.exports.run = async (bot, message, args) => {
    if (args[0] == 'charlog') return funcs.invalid(message);

    switch (args[0]) {
        case 'charinfo':
            sql.get(`SELECT * FROM charlog WHERE userId ="${message.author.id}"`).then(row => {
                if (!row) return message.channel.send("According to my records, you are not a member of our guild.");
                message.channel.send('__**' + row.name + '**__' +
                    '\n**Level:** ' + '[INSERT CHARACTER LEVEL HERE]' +
                    '\n**XP:** ' + row.xp + ' XP' +
                    '\n**TP:** ' + row.tp + ' TP' +
                    '\n**Wealth:** ' + row.gp + ' GP');
            });
            break;
        case 'reward':
            if (!isGM(message.member)) return message.channel.send('You cannot give rewards because you are not a GM.');
            if (isNaN(args[1]) || parseInt(args[1]) <= 0) return message.channel.send('Please specify a valid number.');
            if (!(args[2] == 'xp' || args[2] == 'gp' || args[2] == 'tp')) return message.channel.send('Please specify reward type.');
            let recipients = message.mentions.users;
            if (!recipients) message.channel.send('Please specify at least one recipient.')
            recipients.forEach(recipient => {
                if (recipient.id == message.author.id) {
                    message.channel.send('You cannot reward yourself.');
                }
                else sql.get(`SELECT * FROM charlog WHERE userId ="${recipient.id}"`).then(row => {
                    if (!row) message.channel.send(recipient.toString() + ' has not yet been initiated. Cannot process reward paperwork.');
                    else { // Reward and confirm
                        let amt = parseInt(args[1]);
                        switch(args[2]) {
                            case 'xp':
                                message.channel.send(recipient.toString() + ' has been awarded ' + args[1] + ' XP.' +
                                    ' New XP Total: ' + (row.xp + amt));
                                sql.run(`UPDATE charlog SET xp = ${row.xp + amt} WHERE userId = ${recipient.id}`);
                                break;
                            case 'gp':
                                message.channel.send(recipient.toString() + ' has been awarded ' + args[1] + ' GP.' +
                                    ' New GP Total: ' + (row.gp + amt) + ' gp');
                                sql.run(`UPDATE charlog SET gp = ${row.gp + amt} WHERE userId = ${recipient.id}`);
                                break;
                            case 'tp':
                                message.channel.send(recipient.toString() + ' has been awarded ' + args[1] + ' TP.' +
                                    ' New TP Total: ' + (row.tp + amt));
                                sql.run(`UPDATE charlog SET tp = ${row.tp + amt} WHERE userId = ${recipient.id}`);
                                break;
                        }
                    }
                });
            });
            break;
        case 'initiate':
            sql.get('SELECT * FROM charlog WHERE userId = ' + message.author.id).then(row => {
                message.channel.send(initiate (sql, message, args, row));
            }).catch(() => {
                console.error;
                sql.run('CREATE TABLE IF NOT EXISTS charlog (userId TEXT, name VARCHAR(30), xp INTEGER, gp INTEGER, tp INTEGER)').then(row => {
                    message.channel.send(initiate (sql, message, args, row));
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
            });
            break;
        case 'wipe':
            if (!funcs.isNorrick(message)) return funcs.invalid(message);
            // Clear SQL table - UNDER CONSTRUCTION
            break;
        default:
            return funcs.invalid(message);
    }
}

module.exports.help = {
    name: 'charlog'
}

function initiate (sql, message, args, row) {
    if (!row) { // No character logged. INITIATE!
        if (!args[1]) return 'Initiate who?'; // If no name given
        let futile = args.shift();
        let charname = args.join(' ');
        sql.run("INSERT INTO charlog (userId, name, xp, gp, tp) VALUES (?, ?, ?, ?, ?)", [message.author.id, charname, 300, 0, 0]);
        return message.author.toString() + '\nWelcome, ' + row.name + ', to the Heroes Guild of Remnant.';
    }
    else return 'You must retire your current adventurer before you can initiate a new one.';
}

function isGM(boi) {
    return boi.roles.find('name', 'GM') || boi.roles.find('name', 'Staff');
}