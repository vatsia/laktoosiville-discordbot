function execute(command, args, messageObject, sendMsgCb) {
    sendMsgCb(messageObject['channel_id'], 'https://www.youtube.com/watch?v=6jJkdRaa04g')
}

module.exports.execute = execute
module.exports.alternatives = ['yello']
