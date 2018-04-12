'use strict';

const Dictionary = require('./dictionary');

module.exports = class DictionaryFilter {
    static filter(dictionary, filter) {
        const newDictionary = new Dictionary();
        filter = filter(dictionary);

        dictionary.words.forEach((word) => {
            const count = dictionary.count(word);
            if (filter(count)) {
                newDictionary._add(word, count);
            }
        });

        return newDictionary;
    }

    static ONCE() {
        return (count) => count !== 1;
    }
};
