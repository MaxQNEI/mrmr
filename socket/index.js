const Config = require('../main.config.js');
const MongoHelper = require('../db/mongodb/MongoHelper');

const HTTP = require('http');
const App = HTTP.createServer();
const IO = require('socket.io')(App, {});

const Mongo = new MongoHelper({ ...Config.Mongo });
const { Mongo: { Collection: Collections } } = Config;

const State = {
    Network: {
        Punct: {},
    },
};

Mongo
    .Connect(Config.Mongo.db)
    .then(() => {
        App.listen(Config.Socket.port, Config.Socket.host);

        console.debug('Connect successfully to Mongo!');
        console.debug(`Socket listening at ${Config.Socket.host}:${Config.Socket.port}`);
    })
    .catch(error => console.error('Error while connection to Mongo:', error.message))
    .then(() => {
        SocketController();
    });

function SocketController() {
    IO.on('connect', (Socket) => {
        console.debug(`OnIOConnect(): #${Socket.id}`);

        Socket.on('disconnect', OnSocketDisconnect);
        Socket.on('get-punct-list', OnSocketGetPunctList);
        Socket.on('get-punct-stats', OnSocketGetPunctStats);
        Socket.on('get-punct-info', OnSocketGetPunctInfo);
        Socket.on('get-question-list', OnSocketGetQuestionList);
        Socket.on('get-question-stats', OnSocketGetQuestionStats);
        Socket.on('get-answer-correct', OnSocketGetAnswerCorrect);
        Socket.on('network-logout', OnSocketNetworkLogout);
        Socket.on('network-serve', OnSocketNetworkServe);
        Socket.on('network-participate', OnSocketNetworkParticipate);

        function OnSocketDisconnect(reason) {
            console.debug(`OnSocketDisconnect(): #${Socket.id} - ${reason}`);

            LeaveNetworkPunct(Socket);
        };

        function OnSocketGetPunctList() {
            console.debug(`OnSocketGetPunctList()`);

            Mongo
                .Find(Collections.PunctList, {})
                .then((list) => {
                    Socket.emit('set-punct-list', PunctOut(list));
                });
        }

        function OnSocketGetPunctStats() {
            console.debug(`OnSocketGetPunctStats()`);

            Mongo
                .Find(Collections.PunctList, {})
                .then((list) => {
                    return Promise
                        .all(list.map(({ UUID: punctUUID, QuestionNumberList }) => {
                            return Mongo
                                .Find(Collections.QuestionList, { Number: { $in: QuestionNumberList } })
                                .then(questionList => {
                                    return {
                                        punctUUID,
                                        questionsUUID: questionList.map(({ UUID: questionUUID }) => {
                                            return questionUUID;
                                        })
                                    };
                                });
                        }))
                        .then(results => {
                            return Promise
                                .all(results.map(({ punctUUID, questionsUUID }) => {
                                    return Mongo
                                        .Find(Collections.QuestionStats, { questionUUID: { $in: questionsUUID } })
                                        .then((list) => {
                                            if (!list.length) {
                                                return null;
                                            }

                                            let correct = 0, incorrect = 0;
                                            list.forEach(({ isCorrect }) => (isCorrect ? correct++ : incorrect++));
                                            return { punctUUID, ratio: correct / ((correct + incorrect) || 1) };
                                        });
                                }))
                                .then(results => {
                                    const stats = {};
                                    results.filter(v => v).forEach(({ punctUUID, ratio }) => {
                                        stats[punctUUID] = { ratio };
                                    });
                                    Socket.emit('set-punct-stats', stats);
                                });
                        });
                });
        }

        function OnSocketGetPunctInfo({ Punct: Key }) {
            console.debug(`OnSocketGetPunctList()`, Key);

            Mongo
                .Find(Collections.PunctList, { Key })
                .then((list) => {
                    Socket.emit('set-punct-info', PunctOut(list[0]));
                });
        }

        function OnSocketGetQuestionList({ type, key, count }) {
            console.debug(`OnSocketGetQuestionList():`, type, key, count);

            switch (type) {
                case 'Punct':
                    Mongo
                        .Find(Collections.QuestionList, { PunctKey: key })
                        .then(questionList => {
                            Socket.emit('set-question-list', ArrayRandomize(questionList.map(QuestionOut)));
                        });
                    break;

                case 'Random':
                    Mongo
                        .Find(Collections.QuestionList, {})
                        .then(questionList => {
                            Socket.emit('set-question-list', ArrayRandomize(questionList.map(QuestionOut).slice(0, count)));
                        });
                    break;

                default:
                case 'All':
                    Mongo
                        .Find(Collections.QuestionList, {})
                        .then(list => {
                            list = ArrayRandomize(list);
                            (type === 'random' && count) && (list = list.slice(0, count));
                            Socket.emit('set-question-list', QuestionOut(list));
                        });
                    break;
            }
        }

        function OnSocketGetQuestionStats(questionUUID) {
            return GetQuestionStats(questionUUID).then(stats => {
                IO.emit(`set-question-stats-${questionUUID}`, stats);
            });
        }

        function OnSocketGetAnswerCorrect(questionUUID, answerUUID, punctUUID) {
            console.debug(`OnSocketGetAnswerCorrect(): ${punctUUID} / ${questionUUID} -> ${answerUUID}`);

            Mongo
                .Find(Collections.QuestionList, { UUID: questionUUID })
                .then(([question]) => {
                    const correctUUID = question.AnswerList.filter(answer => answer.isCorrect)[0].UUID;
                    const incorrectUUID = (correctUUID && correctUUID !== answerUUID ? answerUUID : null);

                    Socket.emit('set-answer-correct', correctUUID, incorrectUUID);

                    return Mongo
                        .Insert(Collections.QuestionStats, [{
                            time: Date.now(),
                            questionUUID,
                            answerUUID,
                            isCorrect: !incorrectUUID,
                        }])
                        .then(() => {
                            return { questionUUID }
                        });
                })
                .then(({ questionUUID }) => {
                    return GetQuestionStats(questionUUID).then(stats => {
                        IO.emit(`set-question-stats-${questionUUID}`, stats);
                    });
                });
        }

        function OnSocketNetworkLogout() {
            console.debug(`OnSocketNetworkLogout()`, Socket.id);

            LeaveNetworkPunct(Socket);
        }

        function OnSocketNetworkServe(punctUUID) {
            console.debug(`OnSocketNetworkServe(): ${punctUUID}`);

            JoinNetworkPunct(Socket, punctUUID, 'Serves');
        }

        function OnSocketNetworkParticipate(punctUUID) {
            console.debug(`OnSocketNetworkParticipate(): ${punctUUID}`);

            JoinNetworkPunct(Socket, punctUUID, 'Participates');
        }
    });

    function ArrayRandomize(array) {
        let indexes = Object.keys(array);
        let newArray = [];

        for (let i = 0, vI; i < array.length; i++) {
            vI = indexes[rand(0, (indexes.length - 1))];
            indexes = indexes.filter(_vI => _vI !== vI);
            newArray.push(array[vI]);
        }

        function rand(a, b) {
            return Math.round(Math.random() * (b - a) + a);
        }

        return newArray;
    }

    function PunctOut(punct) {
        if (punct instanceof Array) {
            return punct.map(v => PunctOut(v));
        }

        if (!punct) {
            return punct;
        }

        const { UUID, Key, Punct, Title } = punct;
        return { UUID, Key, Punct, Title };
    }

    function QuestionOut(question) {
        if (question instanceof Array) {
            return question.map(v => QuestionOut(v));
        }

        if (!question) {
            return question;
        }

        let AnswerList = question.AnswerList
            .map(answer => ({ UUID: answer.UUID, Text: answer.Text }));

        let Picture = (question.Picture ? { Picture: question.Picture } : null);

        return {
            UUID: question.UUID,
            Key: question.Key,
            Number: question.Number,
            Text: question.Text,
            Reply: question.Reply,
            AnswerList,
            ...Picture,
        };
    }

    function JoinNetworkPunct(Socket, Key, List) {
        LeaveNetworkPunct(Socket);

        Socket.Network = { Key };

        let punct = (State.Network.Punct[Key] = (State.Network.Punct[Key] || {}));
        punct[List] = (punct[List] || {});
        punct[List][Socket.id] = { Socket };

        Socket.join(Key);
        SendNetworkInfo();
    }

    function LeaveNetworkPunct(Socket, Key = '*') {
        if (Socket.Network) {
            delete Socket.Network.Key;
        }

        for (let _Key in State.Network.Punct) {
            if (Key !== '*' && _Key !== Key) {
                continue;
            }

            let punct = State.Network.Punct[_Key];
            for (let _List in punct) {
                delete punct[_List][Socket.id];
            }

            Socket.leave(_Key);
            SendNetworkInfo();
        }
    }

    function SendNetworkInfo() {
        for (let _Key in State.Network.Punct) {
            let punct = State.Network.Punct[_Key];
            let count = {};
            for (let _List in punct) {
                count[_List] = Object.keys(punct[_List]).length;
            }

            IO.to(_Key).emit('network', {
                ...count,
            });
        }
    }

    function GetQuestionStats(questionUUID) {
        return Promise.all([
            Mongo.Count(Collections.QuestionStats, { questionUUID, isCorrect: true }),
            Mongo.Count(Collections.QuestionStats, { questionUUID, isCorrect: false }),
        ]).then(results => {
            const [Correct, Incorrect] = results;
            return { Correct, Incorrect };
        });
    }
}
