const fs = require('fs');
const funcs = module.require('../funcs.js');

module.exports.run = async (bot, message, args) => {
    if (message.channel.type === 'dm') return;
    if (!args[1]) return message.channel.send('BANK WHAT');
    let dweebid = message.member.id;
    if (args[1] != 'create') {
        if (!bot.bank[dweebid]) return message.channel.send('You do not have a bank account.');
        switch (args[1]) {
            case "delete":
                delete bot.bank[dweebid];
                message.channel.send(message.author.toString() + ' has deleted their bank account.');
                break;
            case "withdraw":
                if (!args[2] || isNaN(parseInt(args[2])))
                    return message.channel.send('Please specify the amount you wish to withdraw.');
                let wamt = parseInt(args[2]);
                if (wamt < 0) return funcs.invalid(message);
                if (bot.bank[dweebid].balance < wamt)
                    return message.channel.send('You have insufficient funds.');
                bot.bank[dweebid].balance -= wamt;
                message.channel.send(message.author.toString() + ' has withdrawn ' + wamt + ' gp.' +
                    '\n**New Balance:** ' + bot.bank[dweebid].balance + ' gp.');
                break;
            case "deposit":
                if (!args[2] || isNaN(parseInt(args[2])))
                    return message.channel.send('Please specify the amount you wish to deposit.');
                let damt = parseInt(args[2]);
                if (damt < 0) return funcs.invalid(message);
                bot.bank[dweebid].balance += damt;
                message.channel.send(message.author.toString() + ' has deposited ' + damt + ' gp.' +
                    '\n**New Balance:** ' + bot.bank[dweebid].balance + ' gp.');
                break;
            case "balance":
                message.channel.send(message.author.toString() + "\n**Balance:** " + bot.bank[dweebid].balance + ' gp.');
                break;
            case "send":
                let recipient = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[2]);
                if (!recipient) return message.channel.send("I need to know who you wish to send money to.");
                if (recipient.id === dweebid) return message.channel.send("Why are you wasting my time? Send money to someone else.");
                if (!bot.bank[recipient.id]) return message.channel.send('This person does not have a bank account.');
                if (!args[3] || isNaN(parseInt(args[3]))) return message.channel.send('Please specify the amount you wish to deposit.');
                let samt = parseInt(args[3]);
                if (samt < 0) return funcs.invalid(message);
                if (bot.bank[dweebid].balance < samt) return message.channel.send('You have insufficient funds.');
                bot.bank[dweebid].balance -= samt;
                bot.bank[recipient.id].balance += samt;
                message.channel.send(message.author.toString() + ' has sent ' + samt + ' gp to ' + recipient.toString() + '.');
                break;
            case "buy":
                if (!args[2] || isNaN(parseInt(args[2])))
                    return message.channel.send('Please specify the amount you wish to withdraw.');
                let buyamt = parseInt(args[2]);
                if (buyamt < 0) return funcs.invalid(message);
                if (!args[3]) return message.channel.send('What do you wish to buy?');
                if (bot.bank[dweebid].balance < buyamt)
                    return message.channel.send('You have insufficient funds for this purchase.');
                bot.bank[dweebid].balance -= buyamt;
                let buything = ''
                for (i = 3; i < args.length; i++) buything += args[i] + ' ';
                message.channel.send(message.author.toString() + ' has purchased ' + buything + 'for ' + buyamt + ' gp.' +
                '\n**New Balance:** ' + bot.bank[dweebid].balance + ' gp.');
                break;
            case "sell":
                if (!args[2] || isNaN(parseInt(args[2])))
                    return message.channel.send('Please specify the amount you wish to deposit.');
                let sellamt = parseInt(args[2]);
                if (sellamt < 0) return funcs.invalid(message);
                if (!args[3]) return message.channel.send('What do you wish to sell?');
                bot.bank[dweebid].balance += sellamt;
                let sellthing = ''
                for (i = 3; i < args.length; i++) sellthing += args[i] + ' ';
                message.channel.send(message.author.toString() + ' has sold ' + sellthing + 'for '+ sellamt + ' gp.' +
                    '\n**New Balance:** ' + bot.bank[dweebid].balance + ' gp.');
                break;
            default: funcs.invalid(message);
        }
    }
    else { // Create a new account
        if (bot.bank[dweebid]) return message.channel.send('You already have a bank account.');
        bot.bank[dweebid] = {
            guild: message.guild.id,
            balance: (args[2] ? parseInt(args[2]) : 0),
        }
        message.channel.send(message.author.toString() + ' has created an account.');
    }

    fs.writeFile('./bank.json', JSON.stringify(bot.bank, null, 4), err => {
        if (err) throw err;
    });
}

module.exports.help = {
    name: 'bank'
}