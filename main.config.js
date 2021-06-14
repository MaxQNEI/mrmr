const LocalConfig = require('./main.config.local.js');

module.exports = {
    ...LocalConfig,
    Mongo: {
        ...LocalConfig.Mongo,
        Collection: {
            Cache: 'Cache',
            PunctList: 'PunctList',
            TicketList: 'TicketList',
            QuestionList: 'QuestionList',
            QuestionStats: 'QuestionStats',
        },
    },
};
