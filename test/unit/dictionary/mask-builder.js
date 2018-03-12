'use strict';

const Dictionary = require('lib/dictionary');
const MaskBuilder = require('lib/dictionary/mask-builder');

describe('dictionary/mask-builder', () => {
    let dictionary;

    beforeEach(() => {
        dictionary = new Dictionary();
        dictionary.add('word1');
        dictionary.add('word2');
        dictionary.add('word3');
    });

    it('should return correct mask', () => {
        const maskBuilder = new MaskBuilder(dictionary);
        maskBuilder.add('word1');
        maskBuilder.add('word4');
        maskBuilder.add('word3');
        maskBuilder.add('word1');

        assert.deepEqual(maskBuilder.getMask(), [1, 0, 1]);
    });

    it('should return mask clone', () => {
        const maskBuilder = new MaskBuilder(dictionary);
        maskBuilder.add('word1');

        const mask = maskBuilder.getMask();
        mask[1] = 100500;

        assert.notDeepEqual(mask, maskBuilder.getMask());
    });
});
