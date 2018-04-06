'use strict';

const {NO_LETTERS, NO_DIGITS, NO_EMAILS} = require('lib/reader-decorator/filters');

describe('reader-decorator/filters', () => {
    describe('NO_LETTERS', () => {
        it('should filter out one letter', () => {
            assert.isFalse(NO_LETTERS('s'));
        });

        it('should accept words', () => {
            assert.isTrue(NO_LETTERS('gT'));
        });
    });

    describe('NO_DIGITS', () => {
        it('should filter out words with digits', () => {
            assert.isFalse(NO_DIGITS('word_has_1_digit'));
        });

        it('should accept words without digits', () => {
            assert.isTrue(NO_DIGITS('word_does_not_have_digits'));
        });
    });

    describe('NO_EMAILS', () => {
        it('should filter out emails', () => {
            assert.isFalse(NO_EMAILS('dmitriy@gmail.com'));
        });

        it('should accept not emails', () => {
            assert.isTrue(NO_EMAILS('regular_word'));
        });
    });
});
