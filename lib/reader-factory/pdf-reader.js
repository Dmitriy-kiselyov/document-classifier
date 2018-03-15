'use strict';

const Promise = require('bluebird');
const PDFParser = require('pdf2json');

const Reader = require('./reader');

module.exports = class PdfReader extends Reader {
    static create(path) {
        return new PdfReader(path);
    }

    constructor(path) {
        super();
        this._path = path;
    }

    async _read() {
        return new Promise((resolve, reject) => {
            const pdfParser = new PDFParser(null, 1);
            pdfParser.on('pdfParser_dataError', errData => reject(errData.parserError));
            pdfParser.on('pdfParser_dataReady', () => {
                const text = pdfParser.getRawTextContent(); //TODO: ---page break---
                resolve(text);
            });

            pdfParser.loadPDF(this._path);
        });
    }
};
