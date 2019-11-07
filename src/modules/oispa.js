function execute(command, args, messageObject, sendMsgCb) {
    if(args.length > 0) {
        args.forEach(oispaElem => {
            sendMsgCb(messageObject['channel_id'], `oispa ${oispaElem}`)
        });
    } else {
        sendMsgCb(messageObject['channel_id'], 'kaljaa')
    }
}

module.exports.execute = execute
module.exports.alternatives = ['oispa', 'tahtoisin']