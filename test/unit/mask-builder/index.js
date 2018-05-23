'use strict';

const Promise = require('bluebird');

const Config = require('lib/config');
const Dictionary = require('lib/dictionary-builder/dictionary');
const MaskBuilder = require('lib/mask-builder');

const createReaderStub = () => {
    return {
        read: sinon.stub().named('read'),
        next: sinon.stub().named('next')
    };
};

describe('mask-builder', () => {
    const sandbox = sinon.createSandbox();
    let dictionary;

    beforeEach(() => {
        dictionary = new Dictionary();
        dictionary.add('word1');
        dictionary.add('word2');
        dictionary.add('word3');
        dictionary.add('word4');

        sandbox.stub(Config, 'get').returns({countWords: false});
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should read files first', async () => {
        const reader = createReaderStub();
        const afterRead = sinon.stub();
        reader.read.returns(Promise.delay(20).then(afterRead));

        const maskBuilder = new MaskBuilder(dictionary);
        await maskBuilder.add(reader);

        assert.calledOnce(reader.read);
        assert.callOrder(afterRead, reader.next);
    });

    it('should create mask from one reader', async () => {
        const reader = createReaderStub();
        reader.read.resolves();
        reader.next
            .onFirstCall().returns('word1')
            .onSecondCall().returns('word5')
            .onThirdCall().returns('word3')
            .returns(undefined);

        const maskBuilder = new MaskBuilder(dictionary);
        await maskBuilder.add(reader);
        const mask = maskBuilder.build();

        assert.deepEqual(mask, [1, 0, 1, 0]);
    });

    it('should create dictionary from multiple readers', async () => {
        const reader1 = createReaderStub();
        reader1.read.resolves();
        reader1.next
            .onFirstCall().returns('word1')
            .onSecondCall().returns('word3')
            .returns(undefined);
        const reader2 = createReaderStub();
        reader2.read.resolves();
        reader2.next
            .onFirstCall().returns('word1')
            .onSecondCall().returns('word4')
            .returns(undefined);

        const maskBuilder = new MaskBuilder(dictionary);
        await maskBuilder.add(reader1);
        await maskBuilder.add(reader2);
        const mask = maskBuilder.build();

        assert.deepEqual(mask, [1, 0, 1, 1]);
    });
});
