'use strict';

module.exports = class Reader {
    constructor() {
        this._words = null;
        this._position = 0;
    }

    async read() {
        this.reset();
        if (this._words === null) {
            const text = await this._read();
            this._words = this._parseText(text);
        }
        return this._words;
    }

    reset() {
        this._position = 0;
    }

    size() {
        if (this._words === null) {
            throw new Error('Should read file first');
        }
        return this._words.length;
    }

    next() {
        if (this._position < this.size()) {
            return this._words[this._position++];
        }
        return undefined; //eof
    }

    _parseText(text) {
        const words = text.trim().split(/[ \n\r\t,/|\\+–=<>()[\]{}]+/g);
        if (isEmpty(words)) {
            throw new Error('File should not be empty');
        }
        return words;
    }
};

function isEmpty(words) {
    return words.length === 0 ||
        words.length === 1 && words[0] === '';
}
