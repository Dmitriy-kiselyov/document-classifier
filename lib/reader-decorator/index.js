'use strict';

const TRIM_TRANSFORMER = (word) => word.trim();
const EMPTY_WORD_FILTER = (word) => word.length !== 0;

module.exports = class ReaderDecorator {
    static create(reader) {
        return new ReaderDecorator(reader);
    }

    constructor(reader) {
        this._reader = reader;
        this._transformers = [];
        this._filters = [];
    }

    addTransformers(transformers) {
        this._transformers.push(...transformers);
    }

    addFilters(filters) {
        this._filters.push(...filters);
    }

    async read() {
        return this._reader.read();
    }

    next() {
        let word;
        do {
            word = this._reader.next();
            if (word === undefined) {
                return word;
            }

            word = this._applyTransformers(word);
        } while (this._applyFilters(word) !== true);

        return word;
    }

    _applyTransformers(word) {
        this._transformers.forEach((transformer) => {
            word = transformer(word);
        });
        return TRIM_TRANSFORMER(word);
    }

    _applyFilters(word) {
        return EMPTY_WORD_FILTER(word) && this._filters.every((filter) => filter(word));
    }
};
