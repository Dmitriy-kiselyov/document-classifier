'use strict';

const Dictionary = require('./dictionary');

module.exports = class DictionaryFilter {
    static filter(dictionary, ...filters) {
        const newDictionary = new Dictionary();

        dictionary.words.forEach((word) => {
            const count = dictionary.count(word);
            if (filters.every((filter) => filter(word, count))) {
                newDictionary._add(word, count);
            }
        });

        return newDictionary;
    }

    static get ONCE() {
        return (word, count) => count !== 1;
    }

    static createCountFilter(times) {
        return (word, count) => count > times;
    }

    static createCommonWordsFilter(dictionary, dictionaries, common = dictionaries.length) {
        const words = new Set();
        dictionary.words.forEach((word) => {
            const count = dictionaries.reduce((count, dict) => dict.has(word) ? count + 1 : count, 0);
            if (count >= common) {
                words.add(word);
            }
        });

        return (word) => !words.has(word);
    }
};
