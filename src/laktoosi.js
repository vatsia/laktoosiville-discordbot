var Discord = require("discord.io");
var logger = require("winston");
var auth = require("./auth.json");

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, 
    {
        colorized: true
    });
logger.level = 'debug';

var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

bot.on('ready', function(event){
    logger.info("CONN");
    logger.info("LOGIN: " + bot.username + " (" + bot.id + ")" );
});

bot.on('message', function(user, user_id, channel_id, message, event){
    if(message.substring(0, 1) == '!'){
        var args = message.substring(1).split(' ');
        var command = args[0];

        args = args.splice(1);
        switch (command) {
            case 'oispa':
            logger.info("TRIGGERING: oispa");
                bot.sendMessage({
                    to: channel_id,
                    message: "kaljaa"
                })
                break;
            case 'safkaa':
                
                break;
            default:
                break;
        }
    }
})