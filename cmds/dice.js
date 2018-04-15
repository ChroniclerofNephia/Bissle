module.exports.run = async (bot, message, args) => {
    switch (args[0].toLowerCase()) {
        case 'r':
            roll(message, args);
            break;
        case 'rr':
            rollLots(message, args);
            break;
        default:
            message.channel.send('Use **,r** to roll dice, or **,commands** for more information.');
    }
}

module.exports.help = {
    name: 'dice'
}

function roll(message, args) {
    var operands = args[1].split(/[+*/-]/);
    let deciform = /^\d+$/;
    var dform = /^\s*(\d*)d(\d+)(?:((?:(?:k|d)(?:h|l)?)|rr|ro|e)?(\d+)){0,1}\s*/;
    var results = []; var dice = []; var q = 0; var ops = []; var total = 0;
    var output = message.author.toString() + '\n';
    if (args[2]) {
        output += '**';
        for (i = 2; i < args.length; i++) {
            output += args[i];
            if (i < args.length-1) output += ' ';
        }
        output += ':** '
    }
    for (i = 0; i < operands.length; i++) {
        var sum = 0;
        if (!operands[i].includes('d')) {
            var constant = deciform.exec(operands[i]);
            if (!constant) {
                message.channel.send(invalid(message));
                return;
            }
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
        if (!operands[ops.length]) { // When a math operator isn't followed by an operand
            message.channel.send(invalid(message));
            return;
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
    output += '\n**Total:** ';
    message.channel.send(output + eval(total));
}

function rollLots(message, args) {
    let deciform = /^\d+$/;
    var iterations = deciform.exec(args[1]);
    if (!iterations) {
        message.channel.send(invalid(message));
        return;
    }
    var operands = args[2].split(/[+*/-]/);
    var dform = /^\s*(\d*)d(\d+)(?:((?:(?:k|d)(?:h|l)?)|rr|ro|e)?(\d+)){0,1}\s*/;
    var results = []; var dice = []; var q = 0; var ops = []; var totals = [];
    var output = message.author.toString() + '\nRolling ';
    if (args[3]) {
        output += '**';
        for (i = 3; i < args.length; i++) {
            output += args[i];
            if (i < args.length-1) output += ' ';
        }
        output += ':**\n'
    } else output += iterations + ' iterations:\n';
    for (its = 0; its < iterations; its++) {
        for (i = 0; i < operands.length; i++) {
            var sum = 0;
            if (!operands[i].includes('d')) {
                var constant = deciform.exec(operands[i]);
                if (!constant) {
                    message.channel.send(invalid(message));
                    return;
                }
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
            if (!operands[ops.length]) { // When a math operator isn't followed by an operand
                message.channel.send(invalid(message));
                return;
            }
            if (i < operands.length-1) {
                q += operands[i].length;
                ops[i] = args[1][q]; output += ops[i] + ' ';
                q++;
            }
            totals[its] = 0;
            if (i == 0)
                totals[its] += sum;
            else {
                totals[its] += ops[i-1] + sum;
            }
            totals[its] = eval(totals[its]);
            output += '= ' + totals[its] + '\n';
        }
    }
    output += '**Total:** ';
    var total = 0;
    for (t = 0; t < totals.length; t++) {
        total += totals[t];
    }
    message.channel.send(output + total);
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
                if(Math.random() > 0)
                    results[0][k] = Math.min(results[0][k], Math.floor(Math.random()*n)+1, Math.floor(Math.random()*n)+1);
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

function isNorrick(message) {
    return (message.member.nickname == 'Loreseeker Norrick') && message.member.roles.find("name" , "Admins");
}