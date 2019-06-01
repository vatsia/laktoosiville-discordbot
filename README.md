# laktoosiville-discordbot

## Installation

Install packages:

```
npm install discord.io winston node-fetch
npm install https://github.com/woor/discord.io/tarball/gateway_v6
```

Configuration:

create a config.js file into the config/ folder

your config.js file should contain:

```
const AUTH_TOKEN ="your personal token";
const FOOD_API_URL = "https://www.sodexo.fi/ruokalistat/output/daily_json";
const FOOD_LANGUAGE = "fi";
const FOOD_RESTAURANT_ID = "31332";

module.exports = {
  AUTH_TOKEN,
  FOOD_API_URL,
  FOOD_LANGUAGE,
  FOOD_RESTAURANT_ID
};

```

copy-paste the code into your config.js file and you are good to go.

## Running

```
node src/laktoosi.js
```
