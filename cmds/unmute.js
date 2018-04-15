module.exports.run = async (bot, message, args) => {
    if (message.member.roles.find("name", "Admins") || message.member.roles.find("name", "Mod")) { // isMod/Admin
        let troll = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[1]);
        if (!troll) return message.channel.send("I can't go dispelling silence at a whim. You gotta tell me who!");
        if (troll.id === message.author.id) return message.channel.send("You can't unsilence yourself.");
        
        let role = message.guild.roles.find(r => r.name === 'Silenced');
        if (!role) {
            return message.channel.send("There's no one to unsilence in the first place.")
        }

        if (!troll.roles.has(role.id)) return message.channel.send("This fellow isn't under the effect of Silence.");

        await troll.removeRole(role);
        message.channel.send(message.author.toString() + " *has dispelled the **Silence** on* " + troll.toString() + '.');
        if (message.channel.name != 'the-hexagon')    
            message.guild.channels.find("name", "the-hexagon").send(message.author.toString() + " *has dispelled the **Silence** on* " + troll.toString() + '.');
    } else message.channel.send("Sorry, kid. That spell is a bit too high level for ye.");
}

module.exports.help = {
    name: 'unmute'
}