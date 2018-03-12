'use strict';

const Dictionary = require('./dictionary');

module.exports = class DictionaryBuilder {
    constructor() {
        this._dictionary = new Dictionary();
    }

    async add(reader) {
        await reader.read();

        let word = reader.next();
        while (word !== undefined) {
            this._dictionary.add(word);
            word = reader.next();
        }
    }

    build() {
        return this._dictionary;
    }
};
