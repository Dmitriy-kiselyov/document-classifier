'use strict';

const Dictionary = require('lib/dictionary-builder/dictionary');
const Mask = require('lib/mask-builder/mask-count');

describe('mask-builder/mask', () => {
    it('should count words on demand', () => {
        const dictionary = new Dictionary();
        dictionary.add('word1');
        dictionary.add('word2');
        dictionary.add('word3');

        const mask = new Mask(dictionary, {count: true});
        mask.add('word1');
        mask.add('word4');
        mask.add('word3');
        mask.add('word1');

        assert.deepEqual(mask.get(), [2, 0, 1]);
    });
});
