const moment = require('moment');

function formatMessage(username, text){
    //returns object of message
    return{
        username,
        text,
        time: moment().format('h:mm a')
    }
}

module.exports = formatMessage;