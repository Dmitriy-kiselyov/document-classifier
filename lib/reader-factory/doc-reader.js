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

    async _read() {
        const result = await mammoth.extractRawText({path: this._path});

        return result.object;
    }
};
