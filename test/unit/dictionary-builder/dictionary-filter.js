'use strict';

const DictionaryFilter = require('lib/dictionary-builder/dictionary-filter');
const Dictionary = require('lib/dictionary-builder/dictionary');

describe('dictionary-builder/dictionary-filter', () => {
    const createDictionary = (words) => {
        const dictionary = new Dictionary();
        words.forEach(({word, count = 1}) => {
            for (let i = 0; i < count; i++) {
                dictionary.add(word);
            }
        });

        return dictionary;
    };

    it('should accept multiple filters', () => {
        const dictionary = createDictionary([{word: 'word1'}, {word: 'word2', count: 2}, {word: 'word3'}]);
        const filter1 = (word, count) => count === 1;
        const filter2 = (word) => word !== 'word1';

        const filteredDictionary = DictionaryFilter.filter(dictionary, filter1, filter2);

        assert.deepEqual(filteredDictionary.words, ['word3']);
    });

    describe('ONCE', () => {
        it('should remove words that appeared only once', () => {
            const words = [
                {word: 'word4', count: 4},
                {word: 'word2', count: 2},
                {word: 'word1', count: 1}
            ];
            const dictionary = DictionaryFilter.filter(createDictionary(words), DictionaryFilter.ONCE);

            assert.deepEqual(dictionary.words, ['word4', 'word2']);
            assert.equal(dictionary.count('word4'), 4);
            assert.equal(dictionary.count('word2'), 2);
        });
    });

    describe('createCountFilter', () => {
        it('should leave words that appeared more times then requested', () => {
            const words = [
                {word: 'word3', count: 3},
                {word: 'word2', count: 2},
                {word: 'word1', count: 1}
            ];
            const dictionary = DictionaryFilter.filter(createDictionary(words), DictionaryFilter.createCountFilter(2));

            assert.deepEqual(dictionary.words, ['word3']);
            assert.equal(dictionary.count('word3'), 3);
        });
    });

    describe('createCommonWordsFilter', () => {
        it('should remove words that appear in every dictionary', () => {
            const dictionary1 = createDictionary([{word: 'word1'}, {word: 'word2'}]);
            const dictionary2 = createDictionary([{word: 'word2'}, {word: 'word3'}]);
            const dictionary3 = createDictionary([{word: 'word3'}, {word: 'word2'}]);
            const dictionary = createDictionary([{word: 'word1'}, {word: 'word2'}, {word: 'word3'}]);

            const createCommonWordsFilter = DictionaryFilter.createCommonWordsFilter([dictionary1, dictionary2, dictionary3]);
            const filteredDictionary = DictionaryFilter.filter(dictionary, createCommonWordsFilter);

            assert.deepEqual(filteredDictionary.words, ['word1', 'word3']);
        });
    });
});
