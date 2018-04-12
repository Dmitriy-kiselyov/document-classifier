'use strict';

module.exports = class Dictionary {
    static create() {
        return new Dictionary();
    }

    constructor() {
        this._map = new Map();
    }

    add(word) {
        const entry = this._map.get(word);
        if (!entry) {
            this._map.set(word, {order: this.size, count: 1});
        } else {
            entry.count++;
        }
    }

    order(word) {
        const entry = this._map.get(word);
        return entry ? entry.order : -1;
    }

    has(word) {
        return this._map.has(word);
    }

    count(word) {
        const entry = this._map.get(word);
        return entry ? entry.count : 0;
    }

    get words() {
        return Array.from(this._map.keys());
    }

    get size() {
        return this._map.size;
    }
};
