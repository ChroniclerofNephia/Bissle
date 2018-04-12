const Discord = require("discord.js");
const settings = require("./botsettings.json");
const bot = new Discord.Client({disableEveryone: true});
const PREFIX = settings.prefix;
bot.login(settings.token);
var autoBoopEnabled = false;

bot.on("ready", async () => {
    console.log("Bissle is ready to rumble!");
});

/**bot.on("guildMemberAdd", function (member) {
    member.guild.channels.find("name", "gate-of-arrival").send("Yo waddap, it's dat " + member.toString());
});**/

bot.on("message", async (message) => {
    if (message.author.equals(bot.user)) return;
    if (autoBoopEnabled) autoBoop(message);
    if (!message.content.startsWith(PREFIX)) return;

    var args = message.content.substring(PREFIX.length).split(" ");
    
    switch (args[0].toLowerCase()) {
        case "r":
            roll(message, args);
            break;
        case "lfg":
            message.delete();
            if (args[1]) { // Interpret specific lfg command
                var x = args[1].toLowerCase();
                if (x == 'list') {
                    let lfglist = message.guild.roles.find("name", "LFG").members.map(m=>m.nickname);
                    if (lfglist.length == 0) {
                        message.channel.send('Sorry, kid. Nobody\'s LFG.');
                        return;
                    }
                    let lfghigh = message.guild.roles.find("name", "LFG-high").members.map(m=>m.nickname);
                    let lfgmid = message.guild.roles.find("name", "LFG-mid").members.map(m=>m.nickname);
                    let lfglow = message.guild.roles.find("name", "LFG-low").members.map(m=>m.nickname);
                    let listed = [];
                    var embed = new Discord.RichEmbed()
                        .setTitle('__Looking For Group__')
                        .setColor(randColor());
                    var title = '**Planehoppers** (Levels 13+)';
                    if (lfghigh.length != 0) {
                        let turds = '';
                        for (twerp in lfghigh) {
                            turds += lfghigh[twerp] + '\n';
                            listed += lfghigh[twerp];
                        }
                        embed.addField(title, turds);
                    } else embed.addField(title, 'Apparently they\'ve all been annihilated by spheres of varying sizes. Shame.');
                    title = '**Crusty Jugglers** (Levels 7-12)';
                    if (lfgmid.length != 0) {
                        let turds = '';
                        for (twerp in lfgmid) {
                            turds += lfgmid[twerp] + '\n';
                            listed += lfgmid[twerp];
                        }
                        embed.addField(title, turds);
                    } else embed.addField(title, "Too busy FTBing to LFG. Tell 'em to get a life and play D&D with you!");
                    title = '**Twerps** (Levels 2-6)';
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
                    message.channel.send(embed);
                }
                else if (x == 'remove') removelfg(message);
                else if (x == 'add') {
                    if (args[2]) addlfg(message, "LFG-"+args[2].toLowerCase());
                    else addlfg(message, "LFG");
                }
                else if (x == 'high' || x == 'mid' || x == 'low') {
                    if(!message.member.roles.find("name", "LFG-"+x))
                        addlfg(message, "LFG-"+x);
                    else
                        removelfg(message);
                }
                else message.channel.send("Sorry, " + message.author.toString() + ". I don't know what the fuck that means.");
                
            } else { // Toggle LFG
                if(!message.member.roles.find("name", "LFG")) addlfg(message, "LFG");
                else removelfg(message);
            }
            break;
        case "dm":
            message.delete();
            if (!message.member.roles.find("name", 'Available to DM')) {
                message.member.addRole(message.member.guild.roles.find("name", 'Available to DM'));
                message.channel.send(message.author.toString() + " is ready to DM!");
            }
            else {
                message.member.removeRole(message.member.guild.roles.find("name", 'Available to DM'));
                message.channel.send(message.author.toString() + " is no longer available to DM.");
            }
            break;
        case "commands":
            message.channel.send(commandList());
            break;
        case "ping":
            message.channel.send(ping());
            break;
        case "joke":
            if (args[1]) joke(message, args[1]);
            else joke(message);
            break;
        case "ask":
            if (args[1]) {
                message.channel.send(tellFortune());
            } else {
                message.channel.send("Speak up sonny! I didn't hear your question.");
            }
            break;
        case "dobidding":
            if (isNorrick(message)) {
                message.delete();
                message.channel.send(dobidding(message));
            }
            break;
        case "invalid":
            if (isNorrick(message)) {
                message.delete();
                message.channel.send(invalid(message));
            }
            break;
        case "boop":
            if (isNorrick(message)) {
                message.delete();
                if (autoBoopEnabled) message.channel.send("Boop Mode: **DISABLED**. All boopers standing by.");
                else message.channel.send("Boop Mode: **ENABLED**. Preparing loins for maximum " + bot.emojis.find("name", "boop") + '.');
                autoBoopEnabled = !autoBoopEnabled;
            }
            break;
        case "test":
            break;
        default: message.channel.send(invalid(message));
    }
});

function commandList() {
    return new Discord.RichEmbed().addField("**Bissle Commands**",
    "**"+PREFIX +"lfg** - Toggles 'LFG' role. Add **high**, **mid**, or **low** to specify desired party level.\n" +
    "        (i.e. **"+PREFIX+"lfg high** for plane-hopping shenanigans)\n" +
    "        Use **"+PREFIX+"lfg list** to get all members currently LFG.\n" +
    "**"+PREFIX +"dm** - Toggles 'Available to DM' role.\n" +
    "**"+PREFIX +"r** - Rolls dice. Supports keep, drop, reroll, exploding dice, high/low selectors.\n" +
    "        (i.e. **"+PREFIX+"r 4d6kh3+3d20dl1-14*1d100ro1/2d4rr1+2d10e10 sick** is valid.)\n" +
    "**"+PREFIX +"ask** - Ask Bissle a yes/no question, and he will answer.\n" +
    "**"+PREFIX +"joke** - Make Bissle tell you a joke.\n" +
    "**"+PREFIX +"ping** - Ping Bissle for testing purposes.\n")
    .setFooter("More functionality will be added as Loreseeker Norrick sees fit.")
    .setColor(randColor());
}

function ping() {
    var pings = [
        "Don't f@%$ing ping me, you d&*#s@#&&%er!",
        "You know pings are just a cry for help.",
        "I bet this is really fun for you isn't it.",
        "...",
        "...",
        "Please stop.",
        "(╯°□°）╯︵ ┻━┻",
    ]
    var x = Math.floor(Math.random()*(pings.length+1));
    if (x == pings.length) {
        message.react(bot.emojis.find("name", "banhammer"));
        return;
    }
    return pings[x];
}

function tellFortune() {
    var fortunes = [
        "Most definitely.",
        "Probably.",
        "That's highly unlikely. Nearly impossible.",
        "Nope.",
        "Maybe.",
        "How the heck should I know?! I'm just a bot!",
        "¯\\_(ツ)_/¯",
    ];
    return fortunes[Math.floor(Math.random() * fortunes.length)];
}

function addlfg(message, role) {
    if (role == "LFG-high" || role == "LFG-mid" || role == "LFG-low")
        message.member.addRole(message.member.guild.roles.find("name", role));
    message.member.addRole(message.member.guild.roles.find("name", "LFG"));
    message.channel.send(message.author.toString() + " is LFG!");
}

function removelfg(message) {
    message.member.removeRole(message.member.guild.roles.find("name", "LFG-high"));
    message.member.removeRole(message.member.guild.roles.find("name", "LFG-mid"));
    message.member.removeRole(message.member.guild.roles.find("name", "LFG-low"));
    message.member.removeRole(message.member.guild.roles.find("name", "LFG"));
    message.channel.send(message.author.toString() + " is no longer LFG.");
}

// FINISH WRITING THIS TURD
function listlfg(message) {
    let output = '';
    return output;
}

function roll(message, args) {
    var operands = args[1].split(/[+*/-]/);
    var dform = /^\s*(\d*)d(\d+)(?:((?:(?:k|d)(?:h|l)?)|rr|ro|e)?(\d+)){0,1}\s*/;
    var results = []; var dice = []; var q = 0; var ops = []; var total = 0;
    var output = message.author.toString() + '\n';
    for (i = 0; i < operands.length; i++) {
        var sum = 0;
        if (!operands[i].includes('d')) {
            sum += parseInt(operands[i]);
            output += operands[i] + ' ';
        }
        else {
            dice = dform.exec(operands[i]);

            // Safeguards v. asshat commands
            if (!dice) {
                message.channel.send(invalid(message));
                return;
            }
            if (dice[2] == 1 && dice[3] == 'e' && dice[4] == 1) {
                message.channel.send(invalid(message));
                return;
            }
            results[i] = rollDice(dice[1], dice[2], message);

            // Operand function goes here
            results[i] = diceOps(dice, results[i], message);
            
            for (j = 0; j < results[i][0].length; j++) {
                sum += results[i][0][j];
            }
            output +=  dice[1] + 'd' + dice[2] + ' (' + results[i][1].join(', ') + ') ';
        }
        if (i < operands.length-1) {
            q += operands[i].length;
            ops[i] = args[1][q]; output += ops[i] + ' ';
            q++;
        }
        if (i == 0)
            total += sum;
        else {
            total += ops[i-1] + sum;
        }
    }
    if (args[2]) {
        output += '\n**';
        for (i = 2; i < args.length; i++) {
            output += args[i];
            if (i < args.length-1) output += ' ';
        }
        output += ':** '
    } else output += '\n**Total:** ';
    message.channel.send(output + eval(total));
}

function rollDice(x, n, message) {
    if (x == '') x = 1;
    var results = [[], []];
    for (k = 0; k < x; k++) {
        if (n == 0) results[0][k] = 0;
        else {
            results[0][k] = Math.floor(Math.random()*n)+1;
            // if sender says 'please', roll really good maybe
            if (message.content.includes('please')) {
                if(Math.random() > 0.99)
                    results[0][k] = Math.max(results[0][k], Math.floor(Math.random()*n)+1, Math.floor(Math.random()*n)+1);
            }
        }
        if(results[0][k] == n || results[0][k] == 1) results[1][k] = '**'+results[0][k]+'**';
        else results[1][k] = ''+results[0][k];
    }
    return results;
}

function diceOps(dice, results, message) {
    if (dice[3] == "dl" || dice[3] == "kh") {
        if (dice[3] == 'kh')
            dice[4] = dice[1]-dice[4];
        for (k = 0; k < dice[4]; k++) {
            var minIndex = -1; var min = dice[2]+1;
            for (j = 0; j < results[0].length; j++) {
                if((results[0][j] < min) && !results[1][j].includes('~')) {
                    min = results[0][j];
                    minIndex = j;
                }
            }
            results[1][minIndex] = '~~'+results[1][minIndex]+'~~';
            results[0][minIndex] = 0;
        }
    }
    else if (dice[3] == "dh" || dice[3] == "kl") {
        if (dice[3] == 'kl')
            dice[4] = dice[1]-dice[4];
        for (k = 0; k < dice[4]; k++) {
            var maxIndex = -1; var max = 0;
            for (j = 0; j < results[0].length; j++) {
                if((results[0][j] > max) && !results[1][j].includes('~')) {
                    max = results[0][j];
                    maxIndex = j;
                }
            }
            results[1][maxIndex] = '~~'+results[1][maxIndex]+'~~';
            results[0][maxIndex] = 0;
        }
    }
    else if (dice[3] == "d") {
        for (j = 0; j < results[0].length; j++) {
            if(results[0][j] == dice[4]) {
                results[1][j] = '~~'+results[1][j]+'~~';
                results[0][j] = 0;
            }
        }
    }
    else if (dice[3] == 'k') {
        for (j = 0; j < results[0].length; j++) {
            if(results[0][j] != dice[4]) {
                results[1][j] = '~~'+results[1][j]+'~~';
                results[0][j] = 0;
            }
        }
    }
    else if (dice[3] == 'rr') {
        for (j = 0; j < results[0].length; j++) {
            if(results[0][j] == dice[4]) {
                results[1][j] = '~~'+results[1][j]+'~~, ';
                var newResult;
                do {
                    newResult = rollDice(1, dice[2], message);
                    if (newResult[0][0] == dice[4]) {
                        results[1][j] += '~~'+newResult[1][0]+'~~, ';
                    }
                } while (newResult[0][0] == dice[4]);
                results[1][j] += newResult[1][0];
                results[0][j] = newResult[0][0];
            }
        }
    }
    else if (dice[3] == 'ro') {
        for (j = 0; j < results[0].length; j++) {
            if(results[0][j] == dice[4]) {
                results[1][j] = '~~'+results[1][j]+'~~, ';
                var newResult = rollDice(1, dice[2], message);
                results[1][j] += newResult[1][0];
                results[0][j] = newResult[0][0];
            }
        }
    }
    else if (dice[3] == 'e') {
        for (j = 0; j < results[0].length; j++) {
            if(results[0][j] == dice[4]) {
                results[1][j] = '__'+results[1][j]+'__, ';
                var newResult;
                do {
                    newResult = rollDice(1, dice[2], message);
                    if (newResult[0][0] == dice[4]) {
                        results[1][j] += '__'+newResult[1][0]+'__, ';
                        results[0][j] += newResult[0][0];
                    }
                } while (newResult[0][0] == dice[4]);
                results[1][j] += newResult[1][0];
                results[0][j] += newResult[0][0];
            }
        }
    }
    return results;
}

function joke(message, x=-1) {
    var joke = [
        "What do you call the unfair advantage undead have in a necropolis?",
        "Why was the werebat scared to fly outside?",
        "Why did the dragon refuse to eat paladins?",
        "What sound did Daemon make when he fell down the stairs?",
        "A monk walks up to a sandwich vendor...",
        "How many guild members does it take to light a candle?",
        "What's the difference between a wizard and a sorcerer?",
        "Why are there no dwarven lawyers?",
        "What's the difference between " + message.author.toString() + " and a gibbering mouther?",
        "A half-orc walks into a bar...",
        "What do you call a magical crystal that traps your soul for eternity?",
        "How do you measure the radius of an enchanted forest?",
        "Did you hear about the wizard that got trapped in his own spellbook?",
        "What do you call a group of skeletal soldiers?",
        "Did you hear about the bard who told everyone he was a harp?",
        "What do you call it when you get knocked down by an ochre jelly?",
        "Why are gelatinous cubes fearless?",
        "What did Sal say to Tad when he entered the guild hall as a giant boa constrictor?",
        "Why do rogues always prefer leather armor?",
        "What do you call a dragon after he eats a group of adventurers?",
        "What did the cleric say to the ham?",
        "What is the best place to attack a paladin?",
        "Did you hear about the monk that killed 75% of the workers in the tavern?",
        "Why shouldn't guild members eat goblin food?",
        "What kind of monster brings you chocolates and flowers before it eats you?",
        "Why do dwarves have such big nostrils?",
        "What did the peasant say to the angry sorceress?",
        "What's worse than finding a worm in your apple?",
        "Two dwarves walk out of a pub.",
        "What's nine feet long, has six legs, and flies?",
        "Why can't an oathbreaker paladin walk straight?",
        "What's the difference between an insane asylum and the Hero's Guild of Remnant?",
        "How do you get a chord from a band of traveling half-orc bards?",
        "How many battlemasters does it take to light a torch?",
        "What do you call a kobold buried up to its neck in sand?",
        "An elven wizard walks into a component shop and asks the merchant for a nice, ripe pound of brains.",
        "An elven bard walks into a tavern...",
        "What do you call a halfling psion on the run from the law?",
        "What did the paladin say to the street food vendor?",
        'A mind flayer hovers into a bar and asks for a drink.',
        "Why do dwarf bards sound better under candlelight?",
        "How many halflings does it take to light a torch?",
        "How many half-elves does it take to light a torch?",
        "How many dwarves does it take to light a torch?",
        "What do you call a good-looking humanoid in Remnant?",
        "A myconid walks into the guild hall...",
        "Two dwarves, Daemon and Foxx, are at sea in a lifeboat after their ship was sunk by pirates...",
        "What's the difference between a half-orc bard and a flumph making their way through Remnant?",
        'A half-orc walks into a bar...',
        "What's the difference between a cowardly, sniveling goblin and a heroic elf using deadly hit-and-run tactics?",
        "What's the difference between a madman who lives in a cave covered in bat poop and a mighty wizard?",
        "What's the best way to unload a cart full of dead elves?",
        "A bard who specializes in ventrioloquism is performing in a tavern...",
        "Why do liches and vampires always speak in riddles?",
        'Four clerics are having a discussion on how much of their tithes goes to their temples and how much for their personal support.',
        "Place your hand on your head and wiggle your fingers. Do you know what that is?",
        "An archmage with a drinking problem has a brilliant idea:",
        "How do umberhulks smell?",
        "A human father has three little half-elven daughters...",
        'Where do you find a kobold with no arms or legs?',
        "What's the difference between a dead badger who's been run over by a wagon and a dead druid who's been run over by a wagon?",
        "How does a wizard learn the Rope Trick spell?",
        "An animated rope enters the guild hall and orders a drink.",
        "What does an ancient red dragon call a hasted tabaxi monk?",
        "How can you tell when the stage an undead orchestra is playing on is level?",
        "What's the difference between a bard and an anchor?",
        "A half-orc is walking down the street, carrying a bag of holding.",
        "Why was the skeleton afraid to cross the road?",
        "An amnesiac druid was peeing in the woods.",
        "What did the triton say when he hit the wall?",
        "Did you hear about the bards who robbed the music shop?",
        "The first mate on a ship runs to the captain, shouting:",
        "A hero walks into the guild hall and sits down at the bar.",
        "Why don't undead bards write new music?",
        "How many gnomes does it take to light a torch?",
        "How many guild members does it take to light a torch?",
        "Not far from Remnant, two rangers are hunting for food in the forest, when they discover a large well in the ground.",
        "How do you get a dwarf to climb up on the roof?",
        "What's the difference between an elf and a trampoline?",
        "What do you call an orc with two brain cells?",
        "They say beauty is in the eye of the beholder."
    ];
    var jokeAnswer = [
        "***Wight*** privilege.",
        "Because every cloud has a ***silver lining***.",
        "Because they taste so ***lawful***.",
        "**CLANGEDIN clangedin** CLANGEDIN clangedin *CLANGEDIN clangedin*",
        '...smirks and says, "Make me one with everything."\n' +
        '"Oh, very clever," The vendor grumbles and hands him a sandwich in exchange for a silver piece.\n' +
        '"Hey," says the monk, "Where\'s my change?"\n' +
        'The sandwich seller piously intones, "Change comes from within."',
        "All of them! ***NEVER SPLIT THE PARTY!***",
        "Class.",
        "They can't pass the bar.",
        "One is a horrible, slimy, disgusting monster and the other is a gibbering mouther.",
        "...and takes " + Math.floor(Math.random()*4 + 1) + " bludgeoning damage.",
        "A maximum security ***prism***.",
        "Find the centaur.",
        "He became en**tome**d.",
        "A reanimated corps.",
        "He was a pathological ***lyre***.",
        "An acid trip.",
        "They've got nothing to ***ooze***.",
        "Yuanti?",
        "It's made of ***hide***.",
        "A party pooper!",
        "You're cured!",
        "Right in the temple!",
        "He left them with a ***quarterstaff***.",
        "It's bad for your ***elf***.",
        "A ***romanticore***.",
        "Because they have big fingers!",
        "Ribbit.",
        "Finding a wyrm in your apple.",
        "(that's it. that's the joke.)",
        "Three dead kobolds!",
        "He's out of alignment.",
        "Magic weapons.",
        "Ask them to play the same note.",
        "Ten. One to light the torch, and nine to tell him how he could have done it better.",
        "Not enough sand.",
        '"I have 3 different kinds," the merchant says. "Human, Dwarf and Orc."\n' +
        '"How much for the human?" the elf asks.\n' +
        '"8 gold." replies the merchant.\n' +
        '"Ah. Not bad," says the elf. "Dwarf may be a bit cheaper, eh?"\n' +
        '"Aye," says the merchant. "6 gold."\n' +
        '"Hmm.. nice. How about the orc brains?"\n' +
        '"600 platinum," says the merchant.\n' +
        '"600 platinum!!" exclaims the wizard. "Why in the nine hells are orc brains so expensive?!"\n' +
        'To which the merchant replies "Do you know how many orcs I have to kill to get a pound of brains?!"',
        '...and asks the crowd, "Who\'s dragon is that outside?"\n' +
        'An older gentleman, dressed in archmage robes stands up, and replies "Mine. Why?"\n' +
        'The bard somberly approaches the mage. "I regret to inform you that the halfling in our party has killed your dragon"\n' +
        '"What!" erupts the archmage. "Your halfling killed Rithvaeraradace. Slayer of that piker Elminster, \n' +
        'Destroyer of Cormyr, Raider of Waterdeep, Ruler of the Dales, Thorn to the Gods, and Bane of all Toril! How did this happen!?"' +
        'The bard sheepishly looks at the archmage and replies "Well...the little guy got stuck in its throat!"',
        "A small medium at large!",
        "Falafel good.",
        'The bartender says "Hey, did you know we have a drink named after you?"\n' +
        'The mind flayer says "You have a drink called Gary?"',
        "Because you can shove the wax in your ears!",
        "You'd trust a halfling with your torch?",
        "Only one. It turns out half-elves are good for something after all.",
        "Twelve. One to count the money, one to check for sliding stone panels, one to light the torch, and nine to drink to the old torch's memory.",
        "A tourist.",
        'Sal says, "I\'m sorry but we don\'t serve your kind here.\n' +
        'The myconid says, "Why not? I\'m a fun guy!"',
        "So they are floating along, when Daemon notices a small crate from the ship's hold floating nearby.\n" +
        "They manage to pull it aboard and crack it open. Inside, they find a small lamp and, on a lark, Foxx pulls out the lamp and rubs it.\n" +
        "***POOF*** \nA Djinn appears and gratefully tells Foxx that for freeing him, he will grant him one wish.\n" +
        'Foxx thinks for a moment and says, "I wish the sea were full of fine dwarven ale!"\n' +
        "The wish is granted and, overjoyed, Foxx begins scooping ale up from the side of the boat and guzzling it with his helm.\n" +
        'After a few minutes, he realizes his companion isn\'t drinking any and asks, "What\'s wrong, Daemon?"\n' +
        '"Foxx, you damned fool, now we have to pee in the boat!"',
        "The flumph is heading to a gig.",
        'The bartender says "We don\'t serve your kind here!"\n' +
        'The half orc responds "That\'s good. I just wanted the fish and chips."',
        "About 3 feet.",
        "A small amount of sulphur.",
        "With a pitchfork.",
        '...doing several jokes about how dumb half-orcs are.\n' +
        'A very large, very mean-looking half-orc in the back of the room stands up and growls,\n' +
        '"I\'m sick of everyone making fun of half-orcs and saying we\'re stupid."\n' +
        'The bard begins to apologize for offending the half-orc.\n' +
        'The half-orc says, "Sir, I wasn\'t talking to you. I was talking to the little smart-ass sitting in your lap."',
        "They're ***crypt***ic!",
        'The cleric of Tyr says, "My faith has strict guidelines. Only after all temple expenses are met can I draw a stipend for myself."\n' +
        'The cleric of Mystra says, "I use my best judgement, based on the current situation. Fortunately, I can create food and water for myself."\n' +
        'The cleric of Tymora says "I stand inside a small circle and toss all our coins high into the air. Any that land inside the circle, I keep."\n' +
        'The cleric of Waukeen says, "I do much the same thing. Save when I throw the coins in the air, Waukeen keeps any that stay there."',
        "An intellect devourer dying of hunger.",
        "He animates his shoes so that no matter how stinking drunk he gets, the shoes will always be able to lead him home.\n" +
        "For a month or so, this works wonderfully. But soon, he finds himself waking up in strange places - he begins drinking in Eversink and wake up in Gaunt, or the Underdark, or Sigil.\n" +
        "Finally he realizes that the shoes had gotten bored with just going back to his home every night, and had become adventurers.\n" +
        "This won't do at all, so he sells the shoes. They come back. Then he gives the shoes away. They come back. He opens a portal to the bloody Elemental Plane of Fire, and tosses the shoes in.\n" +
        "This time, they don't come back. Soon the archmage starts to feel guilty.\n" +
        "After all, he'd given the shoes life, and then casually destroyed them when they became inconvenient.\n" +
        "So he searches out all the greatest clerics on the face of the world, hoping to find some way to ease his guilt.\n" +
        "Finally, a half-mad hermit tells him that he doesn't need to worry - the shoes died immediately and entered the Seven Heavens, and are enjoying eternal bliss.\n" +
        "It turns out, shoes have souls.",
        "Awful!",
        'One of them comes up to him one day and asks, "Daddy, why am I named Rose?"\n' +
        'The father replies, "Honey, when you were a baby, a rose petal fell on your forehead, so we named you Rose."\n' +
        'The second daughter comes up to him afterward and asks, "Daddy, why am I named Lily?"\n' +
        'He replies, "Sweetie, when you were a baby, a lily petal fell on your forehead, so we named you Lily."\n' +
        'The third daughter comes up to him and says, "GAJfnkASJt\'gonGODg!"\n' +
        'The father replies, "Shut up, Boulder!"', 
        'Right where you left him!',
        "A skilled ranger might spot skid marks in front of the badger.",
        "They have to be taut.",
        'Sal growls, "We don\'t serve animated ropes in here. Now get out!"\n' +
        "Dejected, the rope leaves.\n" +
        '5 rounds later, the rope returns wearing a bad disguise: one end has all the strands unraveled resembling a blonde wig, and the other end tied up in a bow.\n' +
        'Sal is not fooled. Enraged, he says, "Hey! You\'re that animated rope I kicked out of here just a few rounds ago!\n' +
        'To which the rope smoothly replies: "No, I\'m a frayed knot."',
        "Fast food.",
        "The lute player is drooling out of both sides of his mouth.",
        "You tie a rope to an anchor before you throw it overboard.",
        'He runs into one of his friends who asks, "Hey, what do you have in that bag?"\n' +
        'The half-orc tells his friend that he has some magic potions in the bag.\n' +
        'His friend says, "Well, I\'ll make you a bet. If I can guess how many potions you have in that bag, you have to give me one."\n' +
        'The half-orc says, "I\'ll tell you what. If you can tell me how many potions I have in this bag, I\'ll give you both of them."',
        "He didn't have the guts.",
        'I think it\'s all coming back to me!" he said.\n' +
        'Then the wind changed.',
        '"Dam!"',
        "They were luters.",
        'Captain, Captain! There\'s a pirate ship off the starboard bow!"\n' +
        'The captain calmly looks at the mate and says, "Bring me my red shirt."\n' +
        'The first mate brings him his red shirt and they fight their way to victory.\n' +
        'About a week later, the first mate again comes running to the captain. "Captain! There are two pirate ships off the port bow, approaching fast!"\n' +
        'Again, the captain simply replies, "Bring me my red shirt," and again they fight their way to victory.\n' +
        'That evening, the crew is celebrating, and the first mate asks the captain, "Sir, why do you always ask for your red shirt when we are being attacked by pirates?"\n' +
        'The captain says, "It is for the crew\'s morale. If I am wounded in battle, the red shirt will show no blood, and the crew will be assured that I am standing strong to lead the way to victory." The first mate nods in understanding and walks away.\n' +
        'A few weeks later, the first mate again comes running up to the captain, out of breath and very frightened. "Captain! There are ten pirate ships approaching, and they are almost upon us, sir!"\n' +
        'The captain looks calmly at the first mate and shouts, "Bring me my brown pants!"',
        'Sal looks over and sees that the hero has a **freakin\' beholder** growing out of the top of his head.\n' +
        'Sal, not wanting to be inhospitable, walks over to the hero and asks, "So, buddy, how did this happen to you?"\n' +
        'The beholder looks over at Sal and says, "I don\'t know. It started out as a pimple on my butt."',
        "They can only decompose.",
        'Three. One to devise a method, one to devise a cure for the ensuing third-degree burns, and one to say, "Egads! My self-lighting torch is working! After twenty-seven years, I\'ve done it!"',
        'Four. One to bring out the tinder and flint, one to protest that magic would light it better, one to question whether a candle is even necessary in this dungeon, and one to say, "Um, I forgot to buy the torch, but I\'ve got three dozen metal spikes, a lockpick, a ten-foot pole..."',
        'One of the rangers, curious as to how deep this well was, threw a small stone into it and turned his head to listen.\n............nothing.\n' +  
        'The other ranger gathers up a larger stone, picking it up with both hands, and throws it in the well. They both turn their heads to the side to listen\n............nothing.\n' +
        'The second ranger exclaims to the first, "Boy, that is some well! Let\'s find something bigger to throw in there."\n' +
        'After a successful investigation check, the two find a cross-tie. The first ranger says "You pick up one side, I\'ll get the other. Surely when this thing hits the bottom we\'ll know it."\n' +
        'So the two throw this cross-tie into the well and begin to listen.\n' + 
        'After a few seconds they hear a goat, wailing at the top of its lungs and barreling straight towards the two rangers!\n' +
        'Dexterity saves passed, the goat charges right between the men, and goes off into the well.\n' +
        'The first ranger is in total shock, and proclaims to the second, "Did you see that crazy goat!!?? That damn thing just jumped in that well!!"\n' +
        'The commotion attracted the attention of a local farmer who made his way over to the hunters. He asked them, "Have you seen my goat? I can\'t seem to find him."\n' + 
        'The first still in shock, the second ranger tells the farmer, "Sure we\'ve seen your goat. He just ran down that hill straight toward us and jumped off into this well!"\n' +
        'The farmer replied, "Nah, that couldn\'t have been my goat. My goat was tied to a cross-tie."',
        'Tell him, "The ale is on the house!"',
        "You take your boots off before you jump on a trampoline.",
        "Pregnant.",
        "I don't care how pretty it is, I ain't going anywhere near those monstrosities!"
    ];
    if (x > joke.length) {
        message.channel.send("Sorry, kiddo. I haven't got that many jokes.");
        return;
    }
    if (x > 0) x--;
    else x = Math.floor(Math.random()*joke.length);
    /** message.delete();
        var embed = new Discord.RichEmbed()
        .addField(joke[x], jokeAnswer[x])
        .setColor(randColor());
    message.channel.send(embed);**/
    message.channel.send(joke[x]);
    message.channel.send(jokeAnswer[x]);
}

function randColor() {
    return '#'+Math.floor(Math.random()*16777215).toString(16);
}

function invalid(message) {
    var responses = [
        "Speak up, kiddo! I didn't understand a word you said.",
        "WHAT DID YOU CALL ME YOU LITTLE TWERP?!",
        "That didn't make a lick of sense.",
        "Sorry, I don't speak abyssal.",
    ];
    let x = Math.floor(Math.random()*(responses.length+1));
    if (x == responses.length) {
        var c = 10;
        var interval = setInterval (function () {
            // use the message's channel (TextChannel) to send a new message
            if (c == 10) {
                message.channel.send('**SERVER RESET IN T-MINUS 10...**');
                c--;
            }
            message.channel.send('**'+c--+'...**')
            .catch(console.error); // add error handling here
            if (c == 0) {
                clearInterval(interval);
                return;
            }
        }, 1000);
    }
    return responses[x];
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
    if (message.member.roles.find("name", 'Prude')) {
        message.react(bot.emojis.find("name", "boop"));
        return;
    }
}

function isNorrick(message) {
    return (message.member.nickname == 'Loreseeker Norrick') && message.member.roles.find("name" , "Admins");
}