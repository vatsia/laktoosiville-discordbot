var Discord = require("discord.io");
var logger = require("winston");
const fetch = require("node-fetch");

var auth = require("./auth.json");
var botsettings = require("./settings.json");

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
    process.argv.forEach(arg => {
        if(arg == "resetbyself"){
            logger.info("RESET OK!")
        }
    })
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
                logger.info("TRIGGERING: food");
                const today = new Date();
                get_menu_by_date(today.getFullYear(), today.getMonth(), today.getDay(), channel_id);
                break;

            case 'reload':
                bot.sendMessage({
                    to: channel_id,
                    message: "Venaa sekka"
                })
                reload_bot()
                break;
            default:
                logger.info("MSG:" + user + "(" + user_id + "):" + channel_id + " :" + message)
                break;
        }
    }
})

const get_menu_by_date = function(year, month, day, channel){
    const url = botsettings.food_api_url + "" + botsettings.food_restaurant_id + "/" + year + "/" + month + "/" + day + "/" + botsettings.food_language;
    logger.info("FETCHING:" + url);
    fetch(url)
        .then( res => res.json())
        .then(json => {
            foods = json.courses
            if(foods.length > 0){
                foods.forEach(element => {
                    bot.sendMessage({
                        to: channel,
                        message: element.title_fi
                    })
                })
            }else{
                bot.sendMessage({
                    to: channel,
                    message: "Janille ei enää tarjoilla"
                })
            }

        })
    
}

const reload_bot = function(){
    logger.warn("RELOADING")
    setTimeout(function(){
        process.on("exit", function(){
            process.argv.push("resetbyself")
            newargs = process.argv
            newargs.push("resetbyself")
            require("child_process").spawn(process.argv.shift(), newargs, {
                cwd: process.cwd(),
                detached: true,
                stdio: "inherit"
            })
        })
        process.exit()
    }, 5000)
}