const log = require('log4js').getLogger('laktoosiville-safkaa')
const fetch = require('node-fetch')

const settings = require('./oispa.json')

const days = [
    "Sunnuntai",
    "Maanantai",
    "Tiistai",
    "Keskiviikko",
    "Torstai",
    "Perjantai",
    "Lauantai"
];

const prefix = `${settings.FOOD_API_URL}/${settings.FOOD_RESTAURANT_ID}`;
const locale = `${settings.FOOD_LANGUAGE}`;
let sayCb

function execute(command, args, messageObject, sendMsgCb) {
    log.info('Safkaa started with command %s', command)
    sayCb = sendMsgCb

    switch(command) {
        case 'ruokaa':
        case 'safkaa':
        case 'safka':
            log.info('Getting food menu for one day')
            let today = new Date();
            if(today.getHours() > 12) {
              today.setDate(today.getDate() + 1)
            }
            get_menu_by_date(today, messageObject.channel_id, true, false);
            break
        case 'kaikkisafkat':
            log.info('Getting food meny for whole week')
            const dates = get_dates_of_week(new Date());
            dates.forEach(day => {
              get_menu_by_date(day, messageObject.channel_id, false, true);
            });
            break
    }
}


const fullDate = date => {
    const dayWithZero = ("0" + date.getDate()).slice(-2)
    const monthWithZero = ("0" + (date.getMonth() + 1)).slice(-2);
    return `${date.getFullYear()}-${monthWithZero}-${dayWithZero}`
};

const get_menu_by_date = (date, channel, say_no_service, say_weekday) => {
  const url = `${prefix}/${fullDate(date)}`;
  fetch(url)
    .then((res) => {
      return res.json()
    })
    .then(json => {
      foods = json.courses
      if (foods.length > 0 || Object.keys(foods).length > 0) {
        let food_str = "";
        if (say_weekday) {
          food_str = "**" + String(days[date.getDay()]) + ":** ";
        }
        if(typeof(foods) === 'object'){
          Object.keys(foods).forEach(element => {
            food_str = food_str + foods[element].title_fi + "\n";
          });
        }else{
          foods.forEach(element => {
            food_str = food_str + element.title_fi + "\n";
          });
        }

        sayCb(channel, food_str);
      } else {
        if (say_no_service) {
            sayCb(channel, "Janille ei enää tarjoilla");
        }
      }
    });
};

const get_dates_of_week = current_date => {
    let dates = new Array();
    current_date.setDate(current_date.getDate() - current_date.getDay() + 1);
    for (let i = 0; i <= 6; i++) {
    dates.push(new Date(current_date));
        current_date.setDate(current_date.getDate() + 1);
    }
    return dates;
};


module.exports.execute = execute
module.exports.alternatives = ['ruokaa', 'kaikkisafkat', 'safka']
