'use strict';

const {TO_LOWER_CASE, TRIM} = require('lib/reader-decorator/transformers');

describe('reader-decorator/transformers', () => {
    describe('TO_LOWER_CASE', () => {
        it('should transform all letters to lower case', () => {
            assert.equal(TO_LOWER_CASE('toLower123Case'), 'tolower123case');
        });
    });

    describe('TRIM', () => {
        it('should trim symbols than should appear only on the end', () => {
            const delim = '_.:-?!`"\'~#;*';

            assert.equal(TRIM(`${delim}A${delim}B${delim}`), `A${delim}B`);
        });
    });
});
