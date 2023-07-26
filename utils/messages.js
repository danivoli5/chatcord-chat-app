const req = require("moment");

const moment = req

function formatMessage(username, text) {
    return {
        username,
        text,
        time: moment().format('h:mm a')
    };
};

module.exports = formatMessage;
