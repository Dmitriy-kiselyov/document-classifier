'use strict';

module.exports = class Mask {
    static create(dictionary, params) {
        return new Mask(dictionary, params);
    }

    constructor(dictionary) {
        this._dictionary = dictionary;
        this._mask = new Array(dictionary.size).fill(0);
    }

    add(word) {
        const order = this._dictionary.order(word);
        if (order !== -1) {
            this._update(order);
        }
    }

    _update(order) {
        this._mask[order] = 1;
    }

    get() {
        return this._mask.slice();
    }
};
