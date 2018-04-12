'use strict';

const {NO_LETTERS, NO_DIGITS, NO_EMAILS, ENGLISH} = require('lib/reader-decorator/filters');

describe('reader-decorator/filters', () => {
    describe('NO_LETTERS', () => {
        it('should filter out one letter', () => {
            assert.isFalse(NO_LETTERS('s'));
        });

        it('should accept words', () => {
            assert.isTrue(NO_LETTERS('gT'));
        });
    });

    describe('ENGLISH', () => {
        it('should recognize english words', () => {
            assert.isTrue(ENGLISH('a'));
            assert.isTrue(ENGLISH('Tatiana'));
            assert.isTrue(ENGLISH('hello-world-love-you'));
            assert.isTrue(ENGLISH('Hello_World_love_you'));
            assert.isTrue(ENGLISH(`break'n'breakfast`));
            assert.isTrue(ENGLISH(`Tom&Jerry`));
        });

        it('should not recognize not english words', () => {
            assert.isFalse(ENGLISH(''));
            assert.isFalse(ENGLISH('Tati0ana'));
            assert.isFalse(ENGLISH('Tati.ana'));
            assert.isFalse(ENGLISH('hello--world'));
            assert.isFalse(ENGLISH('-hello'));
            assert.isFalse(ENGLISH('hello__world'));
            assert.isFalse(ENGLISH('world_'));
            assert.isFalse(ENGLISH('Tom&'));
            assert.isFalse(ENGLISH('Tom-_Jerry'));
        });
    });
});
