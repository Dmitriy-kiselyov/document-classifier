'use strict';

module.exports = class MaskBuilder {
    static create(dictionary) {
        return new MaskBuilder(dictionary);
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

    getMask() {
        return this._mask.slice();
    }
};
