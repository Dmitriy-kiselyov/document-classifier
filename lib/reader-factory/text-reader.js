'use strict';

const fs = require('fs-extra');

const Reader = require('./reader');

module.exports = class TextReader extends Reader {
    static create(path) {
        return new TextReader(path);
    }

    constructor(path) {
        super();
        this._path = path;
    }

    async _read() {
        return fs.readFile(this._path, 'utf-8');
    }
};
