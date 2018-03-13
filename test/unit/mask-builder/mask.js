'use strict';

const Dictionary = require('lib/dictionary-builder/dictionary');
const Mask = require('lib/mask-builder/mask');

describe('mask-builder/mask', () => {
    let dictionary;

    beforeEach(() => {
        dictionary = new Dictionary();
        dictionary.add('word1');
        dictionary.add('word2');
        dictionary.add('word3');
    });

    it('should return correct mask', () => {
        const mask = new Mask(dictionary);
        mask.add('word1');
        mask.add('word4');
        mask.add('word3');
        mask.add('word1');

        assert.deepEqual(mask.get(), [1, 0, 1]);
    });

    it('should return mask clone', () => {
        const maskBuilder = new Mask(dictionary);
        maskBuilder.add('word1');

        const mask = maskBuilder.get();
        mask[1] = 100500;

        assert.notDeepEqual(mask, maskBuilder.get());
    });
});
