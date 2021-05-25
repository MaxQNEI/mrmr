const Config = require('../main.config.js');
const MongoHelper = require('../db/mongodb/MongoHelper/index.js');

const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { v4: guid } = require('uuid');
// const { resolve, extname } = require('path');
const { slugify } = require('transliteration');


const SourceList = {
    ThemeList: {
        url: 'https://vodiy.ua/p/statistics/?ajax=1&title_link=True&_=%TIMESTAMP%',
    },
};

// const Assets = {
//     Image: resolve(`${__dirname}/../public/assets/questions`),
// };


const Slug = (string) => {
    return slugify(string).replace(/[\-]{2,}/g, '-');
};


const FormatDate = (D, format = 'Y/m/d H:i:s.u') => {
    D = (!(D instanceof Date) ? new Date(D) : D);

    return format
        .replace(/Y/g, D.getFullYear())
        .replace(/m/g, (D.getMonth() + 1).toString().padStart(2, '0'))
        .replace(/d/g, D.getDate().toString().padStart(2, '0'))
        .replace(/H/g, D.getHours().toString().padStart(2, '0'))
        .replace(/i/g, D.getMinutes().toString().padStart(2, '0'))
        .replace(/s/g, D.getSeconds().toString().padStart(2, '0'))
        .replace(/u/g, D.getMilliseconds().toString().padEnd(3, '0'));
};

const LogStamp = (function () {
    let prev;

    return (timestamp, options = {}) => {
        const D = (timestamp ? new Date(timestamp) : new Date);

        format = FormatDate(D, options.format);

        format = `${format}${(prev !== undefined && timestamp === undefined ? `(${(((D - 0) - prev) / 1e3).toFixed(3)}s)` : '')}`;
        !options.withoutBrackets && (format = `\[${format}\]`);

        format = `\x1b[37m${format}\x1b[0m`;
        prev = (D - 0);

        return format;
    };
})();

// for(let i = 0; i < 255; i++) {
//     console.debug(`${i} \x1b[${i}mTEXT\x1b[0m`);
// }
// return;

new (class ParseController {
    fetchDelay = 0; // ms
    fetchList = [];

    Mongo;
    // CacheLive = (7 * 24 * 60 * 60 * 1000); // 7 days
    CacheLive = (24 * 60 * 60 * 1000); // 24 hours

    PunctList = {};
    TicketList = {};
    QuestionList = {};

    Start = Date.now();
    Limit = 0;

    constructor() {
        console.debug(LogStamp(), `\x1b[1;95mStart\x1b[0m: ${FormatDate(this.Start)}`);

        this.Mongo = new MongoHelper({ ...Config.Mongo });

        this.Mongo
            .Connect(Config.Mongo.db)
            .then(() => {
                console.debug(LogStamp(), `\x1b[1;95mConnected successfully to Mongo\x1b[0m`);
            })
            .then(() => {
                console.debug(LogStamp(), `\x1b[1;95mGettings Puncts\x1b[0m ...`);

                return this.fetch(SourceList.ThemeList, {}).then((result) => {
                    return result;
                });
            })
            .then(({ res, url }) => {
                console.debug(LogStamp(), `\x1b[1;95mParsing Puncts\x1b[0m ...`);

                const { document } = this.html2dom(res, url);

                const domPunctList = document.querySelectorAll('a');

                domPunctList
                    .forEach((anchor, index) => {
                        if (this.Limit && (index + 1) > this.Limit) { return; }

                        let Title = anchor.textContent.trim();
                        let Punct = Title.replace(/^([\d\.]+) .*?$/, '$1');
                        Title = Title.replace(/^[\d\.]+ (.*?)$/, '$1').trim();

                        this.PunctList[Punct] = {
                            UUID: guid(),
                            Key: Slug(Title),
                            Punct,
                            Title,
                            Url: anchor.href,
                            QuestionList: [],
                        };
                        console.debug(LogStamp(), `\x1b[1;94mFound Punct\x1b[0m: "${Punct}" "${Title}" [${anchor.href}]`);
                    });
            })
            .then(() => {
                const punctListEntries = Object.entries(this.PunctList);
                console.debug(LogStamp(), `\x1b[1;95mTotal Puncts\x1b[0m: ${punctListEntries.length}`);

                const PromiseList = punctListEntries
                    .map(([punctKey, punctItem]) => {
                        return this
                            .fetch(punctItem.Url, {})
                            .then(({ res, url }) => {
                                console.debug(LogStamp(), `\x1b[1;95mParsing Navigation\x1b[0m: ${url} (${res.length} bytes)`);

                                const { document } = this.html2dom(res, url);

                                const pageList = [url];
                                document.querySelectorAll('.navigation_post ul li a').forEach(anchor => {
                                    if (pageList.includes(anchor.href)) { return; }
                                    const pageNumber = anchor.textContent.trim();
                                    console.debug(LogStamp(), `\x1b[1;94mFound Page\x1b[0m: #${pageNumber} ${anchor.href}`);
                                    pageList.push(anchor.href);
                                });
                                console.debug(LogStamp(), `\x1b[1;95mPunct Pages\x1b[0m: ${pageList.length}`);

                                console.debug(LogStamp(), `\x1b[1;95mGetting Pages\x1b[0m ...`);
                                return Promise.all(pageList.map(url => this.fetch(url, {})));
                            })
                            .then(result =>
                                result.map(({ res, url }) => {
                                    console.debug(LogStamp(), `\x1b[1;95mParsing page\x1b[0m: ${url} (${res.length} bytes)`);
                                    return this.parsePage({ res, url, punct: punctItem })
                                })
                            );
                    });

                return Promise.all(PromiseList);
            })
            .then(() => {
                console.debug(LogStamp(), `\x1b[1;95mClearing DB\x1b[0m ...`);
                return Promise
                    .all([
                        this.Mongo
                            .Delete(Config.Mongo.Collection.PunctList)
                            .then(({ result: { n: deleteCount } }) => deleteCount),
                        this.Mongo
                            .Delete(Config.Mongo.Collection.TicketList)
                            .then(({ result: { n: deleteCount } }) => deleteCount),
                        this.Mongo
                            .Delete(Config.Mongo.Collection.QuestionList)
                            .then(({ result: { n: deleteCount } }) => deleteCount),
                    ])
                    .then(result => {
                        console.debug(LogStamp(), `\x1b[1;92mDelete from "${Config.Mongo.Collection.PunctList}"\x1b[0m: ${result[0]}`);
                        console.debug(LogStamp(), `\x1b[1;92mDelete from "${Config.Mongo.Collection.TicketList}"\x1b[0m: ${result[1]}`);
                        console.debug(LogStamp(), `\x1b[1;92mDelete from "${Config.Mongo.Collection.QuestionList}"\x1b[0m: ${result[2]}`);
                    });
            })
            .then(() => {
                console.debug(LogStamp(), `\x1b[1;95mInserting into DB\x1b[0m ...`);
                return Promise
                    .all([
                        this.Mongo
                            .Insert(Config.Mongo.Collection.PunctList, Object.values(this.PunctList))
                            .then(({ result: { n: insertedCount } }) => insertedCount),
                        this.Mongo
                            .Insert(Config.Mongo.Collection.TicketList, Object.values(this.TicketList))
                            .then(({ result: { n: insertedCount } }) => insertedCount)
                            .catch((err) => { console.warn(LogStamp(), `\x1b[1;91m[Error] TicketList: ${err.message}\x1b[0m`) }),
                        this.Mongo
                            .Insert(Config.Mongo.Collection.QuestionList, Object.values(this.QuestionList))
                            .then(({ result: { n: insertedCount } }) => insertedCount),
                    ])
                    .then(result => {
                        console.debug(LogStamp(), `\x1b[1;92mInserted to "${Config.Mongo.Collection.PunctList}"\x1b[0m: ${result[0]}`);
                        console.debug(LogStamp(), `\x1b[1;92mInserted to "${Config.Mongo.Collection.TicketList}"\x1b[0m: ${(result[1] ?? '-')}`);
                        console.debug(LogStamp(), `\x1b[1;92mInserted to "${Config.Mongo.Collection.QuestionList}"\x1b[0m: ${result[2]}`);
                    });
            })
            .finally(() => {
                this.Mongo.Close();

                const End = Date.now();
                const TimeSpent = (((End - this.Start) / 1e3).toFixed(3) + 's.');
                console.debug(LogStamp(), `\x1b[1;95mEnd\x1b[0m: ${FormatDate(End)}`);
                console.debug(LogStamp(), `\x1b[1;95mSpent\x1b[0m: ${TimeSpent}`);
            });
    }

    parsePage({ res, url, punct }) {
        const { document } = this.html2dom(res, url);
        const domQuestionList = document.querySelectorAll('.ticketpage_ul li');

        domQuestionList.forEach((item) => {
            const questionNumber = item.querySelector('input[name="question_number"]').value;
            const domTicketTitle = item.querySelector('.title_ticket');
            const domTicketLeft = item.querySelector('.select_ticket .ticket_left');
            const domTicketLeftImg = item.querySelector('.select_ticket .ticket_left img');
            const domTicketRight = item.querySelector('.select_ticket .ticket_right');
            const domAnswerList = domTicketRight.querySelectorAll('label');
            const domTicketReply = item.querySelector('.reply_ticket');

            const questionTitle = domTicketTitle.textContent.trim();
            const questionText = domTicketTitle.nextElementSibling.textContent.trim();
            const questionReply = (domTicketReply ? { Reply: domTicketReply.textContent.trim() } : null);

            const QuestionKey = `${punct.Punct}${questionNumber}`;

            this.QuestionList[QuestionKey] =
                (this.QuestionList[QuestionKey] || {
                    UUID: guid(),
                    PunctKey: punct.Key,
                    Key: Slug(QuestionKey),
                    Number: questionNumber,
                    Text: questionText,
                    ...questionReply,
                    AnswerList: [],
                });

            punct.QuestionNumberList = (punct.QuestionNumberList || []);
            punct.QuestionNumberList.push(questionNumber);

            if (domTicketLeftImg && !domTicketLeft) {
                console.debug(LogStamp(), 'Not found domTicketLeftImg. domTicketLeft:', domTicketLeft.innerHTML.trim());
            } else if (domTicketLeftImg) {
                this.QuestionList[QuestionKey].Picture = domTicketLeftImg.src;

            }

            domAnswerList.forEach(label => {
                const input = label.querySelector('input');
                const Text = label.querySelector('.span_text').textContent.trim();
                const isCorrect = (input.getAttribute('rel') === 'rt1');

                if (!this.QuestionList[QuestionKey].AnswerList.some(answer => answer.Text === Text)) {
                    this.QuestionList[QuestionKey].AnswerList.push({
                        UUID: guid(),
                        Text,
                        isCorrect,
                    });
                } else {
                    console.debug(LogStamp(), `\x1b[1;93mFound answer duplicate\x1b[0m: ${Text}`);
                }
            });

            // console.debug(LogStamp(), `\x1b[1;95mQuestion\x1b[0m: #${questionTitle} (variants: ${this.QuestionList[questionNumber].AnswerList.length})${(!alreadyExists ? ' | \x1b[92mNew\x1b[0m' : '')}`);
            console.debug(LogStamp(), `\x1b[1;95mQuestion\x1b[0m: #${questionTitle} (variants: ${this.QuestionList[QuestionKey].AnswerList.length})`);
        });
    }

    html2dom(html, url) {
        const jsdom = new JSDOM(html, {
            url,
            contentType: "text/html",
        }, {
            includeNodeLocations: true,
            runScripts: "dangerously",
        });

        return { ...jsdom, document: jsdom.window.document };
    }

    fetch(source, options = {}) {
        let fetchId = guid(), fetchInterval;
        this.fetchList.push(fetchId);

        return new Promise((resolve, reject) => {
            const time = Date.now();
            const url = (source.url || source)
                .replace(/\%TIMESTAMP\%/g, time);

            this.Mongo
                .Delete(
                    Config.Mongo.Collection.Cache,
                    { expire: { $lte: time } }
                )
                .then(() => {
                    if (options.ignoreCache) {
                        return [];
                    }

                    return this.Mongo.Find(Config.Mongo.Collection.Cache, { key: url });
                })
                .then(([cache]) => {
                    fetchInterval = setInterval(() => {
                        if (this.fetchList[0] !== fetchId) {
                            return;
                        }

                        clearInterval(fetchInterval);

                        if (cache && cache.content && cache.expire > time) {
                            console.debug(LogStamp(), `\x1b[1;36mCached\x1b[0m: ${url}`);
                            this.fetchList.shift();
                            resolve(cache.content);
                            return;
                        }

                        setTimeout(() => {
                            console.debug(LogStamp(), `\x1b[1;36mFetch\x1b[0m: ${url}`);

                            fetch(url, options)
                                .then(res => {
                                    switch (source.type) {
                                        default:
                                        case 'html': return res.text();
                                        case 'json': return res.json();
                                        case 'blob': return res.blob();
                                    }
                                })
                                .then(res => {
                                    const result = { res, url };

                                    if (options.ignoreCache) {
                                        return result;
                                    }

                                    return this.Mongo
                                        .Update(
                                            Config.Mongo.Collection.Cache,
                                            [
                                                {
                                                    $set: {
                                                        key: url,
                                                        expire: (Date.now() + this.CacheLive),
                                                        content: result,
                                                    }
                                                },
                                            ],
                                            { key: url },
                                            { upsert: true }
                                        )
                                        .then(({ result: { n: insertedCount } }) => {
                                            // console.debug('isCached?', !!insertedCount);
                                            return result;
                                        });
                                })
                                .then(result => {
                                    resolve(result);
                                })
                                .catch(error => {
                                    console.error('Source Error', error.message, source);
                                    reject(error);
                                })
                                .finally(() => {
                                    this.fetchList.shift();
                                });
                        }, this.fetchDelay);
                    }, 0);
                });
        });
    }
});
