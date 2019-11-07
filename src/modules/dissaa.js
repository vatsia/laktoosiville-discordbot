const fs = require('fs')
const log = require('log4js').getLogger('laktoosiville-dissaa')
const path = require('path')
const dissFilename = path.join(__dirname, "dissaa.json")

function execute(command, args, messageObject, sendMsgCb) {
    let dissJson = getDissData(dissFilename)
    
    if(dissJson === null) {
        sendMsgCb(messageObject.channel_id, 'Error fetching diss-data :((((')
    }

    const hilightMatcher = /\<\@\d+\>/gm
    if(hilightMatcher.test(args[0])){
        // diss person
        const jsonName = args[0].replace('>', '').replace('<', '')
        if(dissJson && dissJson.users && dissJson.users[jsonName] && dissJson.users[jsonName].length > 0){
            const diss = args[0] + " " + dissJson.users[jsonName][Math.floor(Math.random() * dissJson.users[jsonName].length)]
            sendMsgCb(messageObject.channel_id, diss)
        } else {
            sendMsgCb(messageObject.channel_id, "No diss-data for user :(")
        }
    } else if(args[0] && args[0] === 'save') {
        // save new diss form person
        if(hilightMatcher.test(args[1])) {
            // delete hilight marks from name
            const jsonName = args[1].replace('>', '').replace('<', '')
            // construct diss-data
            let dissStr = ''
            for(let i = 2; i < args.length; i++) {
                dissStr += args[i]
                if(i < args.length - 1){
                    dissStr += ' '
                }
            }

            if(dissJson.users[jsonName]){
                dissJson.users[jsonName].push(dissStr)
            } else {
                dissJson.users[jsonName] = [dissStr]
            }
            if(saveDissData(dissFilename, dissJson)){
                sendMsgCb(messageObject.channel_id, "Diss saved to users disses!")
            } else {
                sendMsgCb(messageObject.channel_id, "Error saving users disses!")
            }
        } else if(args[1] === 'general') {
            // save general diss-data
            // construct diss-data
            let dissStr = ''
            for(let i = 2; i < args.length; i++) {
                dissStr += args[i]
                if(i < args.length - 1){
                    dissStr += ' '
                }
            }
            
            // save data
            dissJson.general.push(dissStr)
            if(saveDissData(dissFilename, dissJson)){
                sendMsgCb(messageObject.channel_id, "Diss saved to general disses!")
            }else {
                sendMsgCb(messageObject.channel_id, "Error saving general disses!")
            }
        } else {
            sendMsgCb(messageObject.channel_id, "Invalid name hilight!")
        }
    } else if(!args[0] || args[0] === '') {
        // send general diss
        if(dissJson.general.length > 0) {
            sendMsgCb(messageObject.channel_id, dissJson.general[Math.floor(Math.random() * dissJson.general.length)])
        }
    } else if(args[0] === "help"){
        sendMsgCb(messageObject.channel_id, "Syntax: !dissaa [@name | save @name new diss]")
    }
}

function saveDissData(file, dataObj) {
    try {
        fs.writeFileSync(file, JSON.stringify(dataObj))
        log.info('Diss-data saved!')
        return true
    }catch(e) {
        log.error('Failed to save Diss-data: %s', e.message)
        return false
    }
}

function getDissData(file) {
    if(!fs.existsSync(file)) {
        let fileBase = {
            users : {},
            general : []
        }
        log.warn('No diss-data file exists, creating new one!')
        saveDissData(file, fileBase)
    }

    try {
        let rawData = fs.readFileSync(file)
        let data = JSON.parse(rawData)
        return data
    }catch(e) {
        log.error("Cannot open diss-file: %s", e.message)
        return null
    }
}

module.exports.execute = execute
module.exports.alternatives = ['hauku', 'diss']
