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

    static commonWordsFilter(dictionaries) {
        const words = [];
        dictionaries[0].words.forEach((word) => {
            for (let i = 1; i < dictionaries.length; i++) {
                if (!dictionaries[i].has(word)) {
                    return;
                }
            }
            words.push(word);
        });

        return (word) => !words.includes(word);
    }
};
