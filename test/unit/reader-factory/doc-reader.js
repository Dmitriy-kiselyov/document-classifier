'use strict';

const mammoth = require('mammoth');

const DocReader = require('lib/reader-factory/doc-reader');

describe('reader-factory/doc-reader', () => {
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        sandbox.stub(mammoth, 'extractRawText')
            .withArgs({path: 'path'})
            .resolves({value: ' simple  text\nwith \n \r\n spaces'});
    });

    afterEach(() => sandbox.restore());

    describe('read', () => {
        it('should throw if empty file passed', () => {
            mammoth.extractRawText.withArgs({path: 'path/empty'}).resolves({value: ' \n '});

            const reader = new DocReader('path/empty');

            return assert.isRejected(reader.read(), 'File should not be empty');
        });

        it('should parse text', () => {
            const reader = new DocReader('path');

            return reader.read().then((text) => {
                assert.deepEqual(text, ['simple', 'text', 'with', 'spaces']);
            });
        });
    });

    describe('N', () => {
        it('should throw if file was not read yet', () => {
            const reader = new DocReader('path');

            const size = () => reader.size();
            assert.throws(size, Error, 'Should read file first');
        });

        it('should return number of words', async () => {
            const reader = new DocReader('path');
            await reader.read();

            assert.equal(reader.size(), 4);
        });
    });

    describe('next', () => {
        it('should throw if file was not read yet', () => {
            const reader = new DocReader('path');

            const next = () => reader.next();
            assert.throws(next, Error, 'Should read file first');
        });

        it('should provide next word', async () => {
            const reader = new DocReader('path');
            await reader.read();

            assert.equal(reader.next(), 'simple');
            assert.equal(reader.next(), 'text');
            assert.equal(reader.next(), 'with');
            assert.equal(reader.next(), 'spaces');
            assert.equal(reader.next(), undefined);
        });
    });
});
