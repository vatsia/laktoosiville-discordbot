const Discord = require("discord.io");
const logger = require("winston");
const fetch = require("node-fetch");
const {
  AUTH_TOKEN,
  FOOD_API_URL,
  FOOD_LANGUAGE,
  FOOD_RESTAURANT_ID
} = require("./config/config");

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console(), {
  colorized: true
});
logger.level = "debug";

const bot = new Discord.Client({
  token: AUTH_TOKEN,
  autorun: true
});

const days = [
  "Sunnuntai",
  "Maanantai",
  "Tiistai",
  "Keskiviikko",
  "Torstai",
  "Perjantai",
  "Lauantai"
];

bot.on("ready", event => {
  process.argv.forEach(arg => {
    if (arg == "resetbyself") {
      logger.info("RESET OK!");
    }
  });
  logger.info("CONN");
  logger.info("LOGIN: " + bot.username + " (" + bot.id + ")");
});

bot.on("message", (user, user_id, channel_id, message, event) => {
  if (message.substring(0, 1) == "!") {
    let args = message.substring(1).split(" ");
    const command = args[0];

    args = args.splice(1);
    switch (command) {
      case "oispa":
        logger.info("TRIGGERING: oispa");
        bot.sendMessage({
          to: channel_id,
          message: "kaljaa"
        });
        break;
      case "safkaa":
        logger.info("TRIGGERING: food");
        const today = new Date();
        get_menu_by_date(today, channel_id, true, false);
        break;
      case "kaikkisafkat":
        logger.info("TRIGGERING: all foods");
        const dates = get_dates_of_week(new Date());
        dates.forEach(day => {
          get_menu_by_date(day, channel_id, false, true);
        });
        break;
      case "reload":
        bot.sendMessage({
          to: channel_id,
          message: "Venaa sekka"
        });
        reload_bot();
        break;

      case "painuvittuu":
        logger.warn("EXIT REQUEST BY USER");
        process.exit();
        break;
      default:
        logger.info(
          "MSG:" + user + "(" + user_id + "):" + channel_id + " :" + message
        );
        break;
    }
  }
});
const prefix = `${FOOD_API_URL}/${FOOD_RESTAURANT_ID}`;

const fullDate = date => {
  return `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`;
};

const locale = `${FOOD_LANGUAGE}`;

const get_menu_by_date = (date, channel, say_no_service, say_weekday) => {
  const url = `${prefix}/${fullDate(date)}/${locale}`;
  logger.info("FETCHING:" + url);

  fetch(url)
    .then(res => res.json())
    .then(json => {
      foods = json.courses;
      if (foods.length > 0) {
        let food_str = "";
        if (say_weekday) {
          food_str = String(days[date.getDay()]) + ": ";
        }
        foods.forEach(element => {
          food_str = food_str + element.title_fi + "\n";
        });
        console.log(food_str);
        bot.sendMessage({
          to: channel,
          message: food_str
        });
      } else {
        if (say_no_service) {
          bot.sendMessage({
            to: channel,
            message: "Janille ei enää tarjoilla"
          });
        }
      }
    });
};

const reload_bot = () => {
  logger.warn("RELOADING");
  setTimeout(() => {
    process.on("exit", () => {
      newargs = process.argv;
      if (!newargs.includes("resetbyself")) {
        newargs.push("resetbyself");
      }

      require("child_process").spawn(process.argv.shift(), newargs, {
        cwd: process.cwd(),
        detached: true,
        stdio: "inherit"
      });
    });
    process.exit();
  }, 5000);
};

/** HELPER FUNCTIONS */
const get_dates_of_week = current_date => {
  let dates = new Array();
  current_date.setDate(current_date.getDate() - current_date.getDay() + 1);
  for (let i = 0; i <= 6; i++) {
    dates.push(new Date(current_date));
    current_date.setDate(current_date.getDate() + 1);
  }
  return dates;
};
