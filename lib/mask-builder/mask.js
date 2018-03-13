'use strict';

module.exports = class Mask {
    static create(dictionary) {
        return new Mask(dictionary);
    }

    constructor(dictionary) {
        this._dictionary = dictionary;
        this._mask = new Array(dictionary.size).fill(0);
    }

    add(word) {
        const order = this._dictionary.order(word);
        if (order !== -1) {
            this._mask[order] = 1;
        }
    }

    get() {
        return this._mask.slice();
    }
};
