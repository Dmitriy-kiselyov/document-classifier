'use strict';

const Dictionary = require('lib/dictionary-builder/dictionary');

describe('dictionary-builder/dictionary', () => {
    it('should return words order', () => {
        const dictionary = new Dictionary();
        dictionary.add('word1');
        dictionary.add('word2');

        assert.equal(dictionary.order('word1'), 0);
        assert.equal(dictionary.order('word2'), 1);
    });

    it('should ignore word duplication', () => {
        const dictionary = new Dictionary();
        dictionary.add('word1');
        dictionary.add('word1');

        assert.equal(dictionary.order('word1'), 0);
    });

    it('should return order -1 for words not in dictionary', () => {
        const dictionary = new Dictionary();
        dictionary.add('word1');

        assert.equal(dictionary.order('word2'), -1);
    });

    it('has', () => {
        const dictionary = new Dictionary();
        dictionary.add('word1');

        assert.isTrue(dictionary.has('word1'));
        assert.isFalse(dictionary.has('word2'));
    });

    it('should return correct size', () => {
        const dictionary = new Dictionary();
        dictionary.add('word1');
        dictionary.add('word2');
        dictionary.add('word1');

        assert.equal(dictionary.size, 2);
    });

    it('should count words', () => {
        const dictionary = new Dictionary();
        dictionary.add('word1');
        dictionary.add('word2');
        dictionary.add('word1');

        assert.equal(dictionary.count('word1'), 2);
        assert.equal(dictionary.count('word2'), 1);
        assert.equal(dictionary.count('word3'), 0);
    });
});
