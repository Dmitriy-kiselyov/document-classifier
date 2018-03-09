'use strict';

const mammoth = require('mammoth');

const Reader = require('./reader');

module.exports = class DocReader extends Reader {
    static create(path) {
        return new DocReader(path);
    }

    constructor(path) {
        super();
        this._path = path;
    }

    async read() {
        const text = await mammoth.extractRawText({path: this._path})
            .then((result) => result.value);
        this._parseText(text);

        return this._words;
    }
};
