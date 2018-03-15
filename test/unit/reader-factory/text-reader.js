'use strict';

const fs = require('fs-extra');

const TextReader = require('lib/reader-factory/text-reader');

describe(`reader-factory/text-reader`, () => {
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        sandbox.stub(fs, 'readFile')
            .withArgs('path', 'utf-8')
            .returns(' simple  text\nwith \n \r\n spaces');
    });

    afterEach(() => sandbox.restore());

    describe('read', () => {
        it('should throw if empty file passed', () => {
            fs.readFile.withArgs('path/empty', 'utf-8').returns(' \n ');

            const reader = new TextReader('path/empty');

            return assert.isRejected(reader.read(), 'File should not be empty');
        });

        it('should parse text', async () => {
            const reader = new TextReader('path');

            const text = await reader.read();

            assert.deepEqual(text, ['simple', 'text', 'with', 'spaces']);
        });

        it('should read only once', async () => {
            const reader = new TextReader('path');

            await reader.read();
            await reader.read();

            assert.calledOnce(fs.readFile);
        });
    });

    describe('N', () => {
        it('should throw if file was not read yet', () => {
            const reader = new TextReader('path');

            const size = () => reader.size();
            assert.throws(size, Error, 'Should read file first');
        });

        it('should return number of words', async () => {
            const reader = new TextReader('path');
            await reader.read();

            assert.equal(reader.size(), 4);
        });
    });

    describe('next', () => {
        it('should throw if file was not read yet', () => {
            const reader = new TextReader('path');

            assert.throws(() => reader.next(), Error, 'Should read file first');
        });

        it('should provide next word', async () => {
            const reader = new TextReader('path');
            await reader.read();

            assert.equal(reader.next(), 'simple');
            assert.equal(reader.next(), 'text');
            assert.equal(reader.next(), 'with');
            assert.equal(reader.next(), 'spaces');
            assert.equal(reader.next(), undefined);
        });
    });

    describe('reset', () => {
        it('should start reading words from beginning', async () => {
            const reader = new TextReader('path');

            await reader.read();
            reader.next();
            reader.next();
            reader.reset();

            assert.equal(reader.next(), 'simple');
            assert.equal(reader.next(), 'text');
        });

        it('should reset on read', async () => {
            const reader = new TextReader('path');
            sandbox.spy(reader, 'reset');

            await reader.read();
            reader.next();
            reader.next();
            await reader.read();

            assert.calledTwice(reader.reset);
            assert.equal(reader.next(), 'simple');
            assert.equal(reader.next(), 'text');
        });
    });
});
