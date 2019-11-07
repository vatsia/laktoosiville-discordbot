const DiscordLib = require('discord.io');
const log = require('log4js').getLogger('laktoosiville-main')
const fs = require('fs')
const path = require('path')

const moduleFolder = path.join(__dirname, 'modules/')
const {
  AUTH_TOKEN,
} = require(path.join(__dirname, './config/config'))

let discord
let modules = {}
let aliasNames = {}

function main() {
  log.level = "INFO"
  log.info('Starting Laktoosiville...')
  loadModules()
  initBot(AUTH_TOKEN)
}

function initBot(token) {
  discord = new DiscordLib.Client({token: token, autorun: true})
  discord.on('ready', handleBotReady)
  discord.on('message', handleMessage)
}

function handleBotReady(event) {
  log.info('Laktoosiville is connected to discord!, event = %s', JSON.stringify(event))
}

function handleMessage(user, userId, channelId, message, event) {
  if (message.substring(0, 1) === "!") {
    log.info('Command received. Starting to parse...')
    let args = message.substring(1).split(" ");
    let command = args.shift().toLowerCase()
    const msgObj = {username: user, user_id: userId, channel_id: channelId}

    log.info('Parsing done. Command = %s. Finding handler...', command)
    
    // for reloading modules straight from discord without restarting bot
    if(command === 'reload_modules') {
      loadModules()
      messageSendingCallback(msgObj.channel_id, "Reloaded modules :)")
      return
    }

    // print commands availablei
    if(command === 'commands') {
      printCommands(msgObj.channel_id)
    }

    if(modules[command]) {
      log.info('Module for command found! Starting it...')

      modules[command].execute(command, args, msgObj, messageSendingCallback)
    } else {
      log.warn('Module not found. Checking alternatives')
      if(aliasNames[command]) {
        modules[aliasNames[command]].execute(command, args, msgObj, messageSendingCallback)
      }else {
        log.error('Module not found')
      }
    }

  }
}

function messageSendingCallback(channel_id, message) {
  log.info('Sending message to channel = %s', channel_id)
  discord.sendMessage({
    to: channel_id,
    message: message
  });
}

function loadModules() {
  let moduleFiles = []
  modules = {}
  
  try {
    moduleFiles = fs.readdirSync(moduleFolder)
  } catch(e) {
    log.error('Error opening modulefolder! Error = %s', e.message)
    return;
  }

  if(moduleFiles.length > 0) {
    log.info('%s', JSON.stringify(moduleFiles))
    moduleFiles.forEach(function (f) {
      if(f.endsWith('.js')) {
        try {
          let command = f.replace(/\.js$/, '').toLowerCase()
          modules[command] = require(`${moduleFolder}/${f}`)
          if(modules[command].alternatives) {
            log.info('Module has alternative names: %s', modules[command].alternatives)
            modules[command].alternatives.forEach(function (altName) {
              log.info('Added alias %s for module %s', altName, command)
              aliasNames[altName] = command
            })
          }
        }catch(e) {
          log.error('Error loading module = %s, Error = %s', f, e.message)
        }
      }
    })
  }
}

function printCommands(channel_id) {
  Object.keys(modules).forEach(function (m) {
    let alterNames = ''
    if(modules[m].alternatives.length > 0){
      alterNames += '**Aliases**: '
      modules[m].alternatives.forEach(function (name) {
        alterNames += name + ' '
      })
    }
    messageSendingCallback(channel_id, `**Module**: ${m} ${alterNames}`)
  })
}

main()
