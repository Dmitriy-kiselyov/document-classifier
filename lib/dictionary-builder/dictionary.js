'use strict';

module.exports = class Dictionary {
    static create() {
        return new Dictionary();
    }

    constructor() {
        this._map = new Map();
    }

    add(word) {
        if (!this._map.has(word)) {
            this._map.set(word, this.size);
        }
    }

    order(word) {
        const order = this._map.get(word);
        return order === undefined ? -1 : order;
    }

    has(word) {
        return this._map.has(word);
    }

    get words() {
        return Array.from(this._map.keys());
    }

    get size() {
        return this._map.size;
    }
};
