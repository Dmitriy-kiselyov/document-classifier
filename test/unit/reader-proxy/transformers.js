'use strict';

const {TO_LOWER_CASE} = require('lib/reader-proxy/transformers');

describe('reader-proxy/transformers', () => {
    describe('TO_LOWER_CASE', () => {
        it('should transform all letters to lower case', () => {
            assert.equal(TO_LOWER_CASE('toLower123Case'), 'tolower123case');
        });
    });
});
