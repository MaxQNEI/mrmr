const Config = require('../main.config.js');
const MongoHelper = require('../db/mongodb/MongoHelper');

const HTTP = require('http');
const App = HTTP.createServer();
const IO = require('socket.io')(App, {});

const Mongo = new MongoHelper({ ...Config.Mongo });

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
    .then(() => {
        SocketController();
    });

function SocketController() {
    IO.on('connect', (Socket) => {
        console.debug(`OnIOConnect(): #${Socket.id}`);

        Socket.on('disconnect', OnSocketDisconnect);
        Socket.on('get-punct-list', OnSocketGetPunctList);
        Socket.on('get-punct-info', OnSocketGetPunctInfo);
        Socket.on('get-question-list', OnSocketGetQuestionList);
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

            Mongo.Find(Config.Mongo.Collection.PunctList, {})
                .then((list) => {
                    Socket.emit('set-punct-list', PunctOut(list));
                });
        }

        function OnSocketGetPunctInfo({ Punct: Key }) {
            console.debug(`OnSocketGetPunctList()`, Key);

            Mongo.Find(Config.Mongo.Collection.PunctList, { Key })
                .then((list) => {
                    Socket.emit('set-punct-info', PunctOut(list[0]));
                });
        }

        function OnSocketGetQuestionList({ type, key, count }) {
            console.debug(`OnSocketGetQuestionList():`, type, key, count);

            switch (type) {
                case 'Punct':
                    Mongo
                        .Find(Config.Mongo.Collection.QuestionList, { PunctKey: key })
                        .then(questionList => {
                            Socket.emit('set-question-list', ArrayRandomize(questionList.map(QuestionOut)));
                        });
                    break;

                case 'Random':
                    Mongo
                        .Find(Config.Mongo.Collection.QuestionList, {})
                        .then(questionList => {
                            Socket.emit('set-question-list', ArrayRandomize(questionList.map(QuestionOut).slice(0, count)));
                        });
                    break;

                default:
                case 'All':
                    Mongo
                        .Find(Config.Mongo.Collection.QuestionList, {})
                        .then(list => {
                            list = ArrayRandomize(list);
                            (type === 'random' && count) && (list = list.slice(0, count));
                            Socket.emit('set-question-list', QuestionOut(list));
                        });
                    break;
            }
        }

        function OnSocketGetAnswerCorrect(questionUUID, answerUUID) {
            console.debug(`OnSocketGetAnswerCorrect(): ${questionUUID} -> ${answerUUID}`);

            Mongo
                .Find(Config.Mongo.Collection.QuestionList, { UUID: questionUUID })
                .then(([question]) => {
                    const correctUUID = question.AnswerList.filter(answer => answer.isCorrect)[0].UUID;
                    const incorrectUUID = (correctUUID && correctUUID !== answerUUID ? answerUUID : null);

                    Socket.emit('set-answer-correct', correctUUID, incorrectUUID);
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
}
