const Discord = require("discord.io");
const logger = require("winston");
const fetch = require("node-fetch");
const axios = require("axios");
const {
  AUTH_TOKEN,
  FOOD_API_URL,
  FOOD_LANGUAGE,
  FOOD_RESTAURANT_ID
} = require("./config/config");
const moment = require("moment");
const R = require("ramda");

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console(), {
  colorized: true
});
logger.level = "debug";

const bot = new Discord.Client({
  token: AUTH_TOKEN,
  autorun: true
});
moment.locale("fi");
const daysOfWeek = moment.weekdays(true);

bot.on("ready", event => {
  process.argv.forEach(arg => {
    if (arg == "resetbyself") {
      logger.info("RESET OK!");
    }
  });
  logger.info("CONN");
  logger.info("LOGIN: " + bot.username + " (" + bot.id + ")");
});

const prefix = `${FOOD_API_URL}/${FOOD_RESTAURANT_ID}`;

const fullDate = () => {
  const date = moment();
  return `${date.year()}/${date.add({ M: 1 }).month()}/${date.date()}`;
};

const locale = `${FOOD_LANGUAGE}`;

const sleep = millisecondsToWait => {
  const now = new Date().getTime();
  while (new Date().getTime() < now + millisecondsToWait) {}
};

const get_menu_by_date = (channel, say_no_service, say_weekday) => {
  const url = `${prefix}/${fullDate()}/${locale}`;
  logger.info("FETCHING:" + url);

  fetch(url)
    .then(res => res.json())
    .then(json => {
      let foods = json.courses;
      const foodsWithDate = R.assoc("date", `${fullDate()}`, foods);

      // console.log(foodsWithDate);
      if (foods.length > 0) {
        let food_str = "";
        if (say_weekday) {
          food_str = String(daysOfWeek[today]) + ": ";
        }
        foods.forEach(element => {
          food_str = food_str + element.title_fi + "\n";
        });
        bot.sendMessage({
          to: channel,
          message: food_str
        });
      } else {
        if (say_no_service) {
          bot.sendMessage({
            to: channel,
            message: "Tänään ei lounasta"
          });
        }
      }
    });
};

const get_dates_of_week = () => {
  const currentDate = moment();
  const startOfWeek = currentDate.clone().startOf("isoWeek");
  const endOfWeek = currentDate.clone().endOf("isoWeek");

  let dates = [];
  let day = startOfWeek;

  while (day.isSameOrBefore(endOfWeek)) {
    dates.push(day.toDate());
    day = day.clone().add(1, "d");
  }

  return dates;
};

const asyncForEach = async (dates, callback) => {
  for (let index = 0; index < dates.length; index++) {
    const url = `${prefix}/${moment(dates[index]).format(
      "YYYY/M/D"
    )}/${locale}`;
    logger.info("FETCHING:" + url);
    const response = await fetch(url);
    const json = await response.json();
    const processedJson = R.assoc(
      "date",
      `${moment(dates[index]).format("YYYY/M/D")}`,
      json.courses
    );
    // console.log(processedJson);
    await callback(processedJson);
  }
};

const get_menu_by_week = async callback => {
  const dates = get_dates_of_week();
  let listOfMenus = [];
  const getMenus = async () => {
    asyncForEach(dates, async menu => {
      listOfMenus.push(menu);
    }).then(() => {
      callback(listOfMenus, dates);
    });
  };
  await getMenus();
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

const parseObject = async (object, callback) => {
  const date =
    object.date !== null
      ? `${object.date} ${
          daysOfWeek[moment(object.date, "YYYY/M/D").weekday()]
        }: \n`
      : "";
  const onlyFoods = R.dissoc("date", object);
  const menusPerDay = R.map(
    (food, index) => ({
      title_fi: R.pathOr(null, ["title_fi"], food)
    }),
    onlyFoods
  );
  let foodString = "";
  foodString = date + "\n";

  for (let key in menusPerDay) {
    if (menusPerDay[key].title_fi !== "") {
      foodString += menusPerDay[key].title_fi + "\n";
    }
  }
  await callback(foodString);
};

bot.on("message", async (user, user_id, channel_id, message) => {
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
        get_menu_by_date(channel_id, true, false);
        break;
      case "kaikkisafkat":
        logger.info("TRIGGERING: all foods");
        let menus = [];
        let parsedMenus = [];
        await get_menu_by_week(data => {
          menus = data;

          say_weekday = true;
          say_no_service = false;
          if (menus.length > 0) {
            menus.map(dayObject => {
              const getString = async callback => {
                await parseObject(dayObject, async menuString => {
                  await callback(menuString);
                });
              };
              getString(menu => {
                bot.sendMessage({
                  to: channel_id,
                  message: menu
                });
              });
            });
          } else {
            if (say_no_service) {
              bot.sendMessage({
                to: channel_id,
                message: "Janille ei enää tarjoilla"
              });
            }
          }
        });
        // const sortedMenus = sortMenuArray(menus)
        // console.log(menus);
        // sortedMenus.forEach(menu => {
        //   console.log(menu);
        // bot.sendMessage({
        //   to: channel_id,
        //   message: menu.title_fi
        // });
        // });
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
