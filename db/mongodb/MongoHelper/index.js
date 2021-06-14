const { MongoClient } = require('mongodb');

module.exports = class MongoHelper {
    url;
    db;
    client;
    collections = {};

    constructor({ url }) {
        this.url = url;
    }

    Connect(dbName = '') {
        this.client = new MongoClient(this.url, { useUnifiedTopology: true });

        return this.client
            .connect()
            .then(() => {
                this.db = this.client.db(dbName);
            })
            .catch((err) => {
                console.debug('[Error] MongoHelper->Connect():', err);
                throw err;
            });
    }

    Close() {
        this.client.close();
    }

    Collection(collectionName = '') {
        if (!this.db) { return; }
        return (this.collections[collectionName] = (this.collections[collectionName] ?? this.db.collection(collectionName)));
    }

    Insert(collectionName = '', documents = [], options = {}) {
        return this
            .Collection(collectionName)
            .insertMany(documents, options);
    }

    Update(collectionName = '', documents = [], filter = {}, options = {}) {
        return this
            .Collection(collectionName)
            .updateMany(filter, documents, options);
    }

    Delete(collectionName = '', filter = {}) {
        return this
            .Collection(collectionName)
            .deleteMany(filter, {});
    }

    Find(collectionName = '', filter = {}) {
        return this
            .Collection(collectionName)
            .find({})
            .filter(filter)
            .toArray();
    }

    Count(collectionName = '', query = {}, options = {}) {
        return this
            .Collection(collectionName)
            .countDocuments(query, options);
    }
}
