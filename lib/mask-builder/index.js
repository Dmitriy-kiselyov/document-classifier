'use strict';

const Config = require('../config');
const Mask = require('./mask');
const MaskWithCount = require('./mask-count');

module.exports = class MaskBuilder {
    static create(dictionary) {
        return new MaskBuilder(dictionary);
    }

    constructor(dictionary) {
        const MaskClass = Config.get().countWords ? MaskWithCount : Mask;
        this._mask = new MaskClass(dictionary);
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
