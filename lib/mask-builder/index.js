'use strict';

const Mask = require('./mask');

module.exports = class MaskBuilder {
    static create(dictionary) {
        return new MaskBuilder(dictionary);
    }

    constructor(dictionary) {
        this._mask = new Mask(dictionary);
    }

    async add(reader) {
        await reader.read();

        let word = reader.next();
        while (word !== undefined) {
            this._mask.add(word);
            word = reader.next();
        }
    }

    build() {
        return this._mask.get();
    }
};
