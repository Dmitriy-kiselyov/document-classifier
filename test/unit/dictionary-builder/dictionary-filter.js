'use strict';

const DictionaryFilter = require('lib/dictionary-builder/dictionary-filter');
const Dictionary = require('lib/dictionary-builder/dictionary');

describe('dictionary-builder/dictionary-filter', () => {
    const createDictionary = () => {
        const words = [
            {word: 'word4', count: 4},
            {word: 'word2', count: 2},
            {word: 'word1', count: 1}
        ];

        const dictionary = new Dictionary();
        words.forEach(({word, count}) => {
            for (let i = 0; i < count; i++) {
                dictionary.add(word);
            }
        });

        return dictionary;
    };

    it('should remove words that appeared only once', () => {
        const dictionary = DictionaryFilter.filter(createDictionary(), DictionaryFilter.ONCE);

        assert.deepEqual(dictionary.words, ['word4', 'word2']);
        assert.equal(dictionary.count('word4'), 4);
        assert.equal(dictionary.count('word2'), 2);
    });
});
