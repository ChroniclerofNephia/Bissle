const Discord = module.require('discord.js');

module.exports.run = async (bot, message, args) => {
    message.delete();
    if (args[1]) { // Interpret specific lfg command
        var x = args[1].toLowerCase();
        if (x == 'list') message.channel.send(listlfg(message));
        else if (x == 'remove') removelfg(message);
        else if (x == 'add') {
            if (args[2]) addlfg(message, "LFG-"+args[2].toLowerCase());
            else addlfg(message, "LFG");
        }
        else if (x == 'high' || x == 'mid' || x == 'low') {
            if(!message.member.roles.find("name", "LFG-"+x))
                addlfg(message, "LFG-"+x);
            else
                removelfg(message, args[1]);
        }
        else message.channel.send(invalid(message));
        
    } else { // Toggle LFG
        if(!message.member.roles.find("name", "LFG")) addlfg(message, "LFG");
        else removelfg(message);
    }
}

module.exports.help = {
    name: 'lfg'
}

function addlfg(message, role) {
    if (role == "LFG-high" || role == "LFG-mid" || role == "LFG-low")
        message.member.addRole(message.member.guild.roles.find("name", role));
    message.member.addRole(message.member.guild.roles.find("name", "LFG"));
    message.channel.send(message.author.toString() + " is LFG!");
}

function removelfg(message, tier='') {
    if (tier == 'low' || tier == 'mid' || tier == 'high')
        return message.member.removeRole(message.member.guild.roles.find("name", "LFG-"+tier));
    message.member.removeRole(message.member.guild.roles.find("name", "LFG-high"));
    message.member.removeRole(message.member.guild.roles.find("name", "LFG-mid"));
    message.member.removeRole(message.member.guild.roles.find("name", "LFG-low"));
    message.member.removeRole(message.member.guild.roles.find("name", "LFG"));
    message.channel.send(message.author.toString() + " is no longer LFG.");
}

function toggleRole(message, role) {
    if (message.member.roles.find("name", role)) message.member.removeRole(message.member.guild.roles.find("name", role));
    else message.member.addRole(message.member.guild.roles.find("name", role));
}

function listrole(message, role) {
    //do something
}

function listlfg(message) {
    let lfglist = message.guild.roles.find("name", "LFG").members.map(m=>m.nickname);
    if (lfglist.length == 0) return 'Sorry, kid. Nobody\'s LFG.';
    let lfghigh = message.guild.roles.find("name", "LFG-high").members.map(m=>m.nickname);
    let lfgmid = message.guild.roles.find("name", "LFG-mid").members.map(m=>m.nickname);
    let lfglow = message.guild.roles.find("name", "LFG-low").members.map(m=>m.nickname);
    let listed = [];
    var embed = new Discord.RichEmbed()
        .setTitle('__Looking For Group__')
        .setColor(randColor());
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
    if (lfglist.length != 0) {
        title = '**Desperately LFG** (literally any level PLZ)';
        let turds = '';
        for (twerp in lfglist) if (!listed.includes(lfglist[twerp])) turds += lfglist[twerp] + '\n';
        if (turds != '') embed.addField(title, turds);
    }
    return embed;
}

function randColor() {
    return '#'+Math.floor(Math.random()*16777215).toString(16);
}