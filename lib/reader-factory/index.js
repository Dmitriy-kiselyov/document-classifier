'use strict';

const path = require('path');

const TextReader = require('./text-reader');
const DocReader = require('./doc-reader');
const PdfReader = require('./pdf-reader');

module.exports = class ReaderFactory {
    static create(file) {
        const ext = path.extname(file).toLowerCase();
        switch (ext) {
            case '.doc':
            case '.docx':
                return DocReader.create(file);
            case '.pdf':
                return PdfReader.create(file);
            default:
                return TextReader.create(file);
        }
    }
};
