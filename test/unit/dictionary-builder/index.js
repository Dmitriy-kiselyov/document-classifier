'use strict';

const Promise = require('bluebird');

const DictionaryBuilder = require('lib/dictionary-builder');

const createReaderStub = () => {
    return {
        read: sinon.stub().named('read'),
        next: sinon.stub().named('next')
    };
};

describe('dictionary-builder', () => {
    it('should read files first', async () => {
        const reader = createReaderStub();
        const afterRead = sinon.stub();
        reader.read.returns(Promise.delay(20).then(afterRead));

        const dictionaryBuilder = new DictionaryBuilder();
        await dictionaryBuilder.add(reader);

        assert.calledOnce(reader.read);
        assert.callOrder(afterRead, reader.next);
    });

    it('should create dictionary from one reader', async () => {
        const reader = createReaderStub();
        reader.read.resolves();
        reader.next
            .onFirstCall().returns('hello')
            .onSecondCall().returns('world')
            .onThirdCall().returns('hello')
            .returns(undefined);

        const dictionaryBuiler = new DictionaryBuilder();
        await dictionaryBuiler.add(reader);
        const dictionary = dictionaryBuiler.build();

        assert.equal(dictionary.size, 2);
        assert.equal(dictionary.order('hello'), 0);
        assert.equal(dictionary.order('world'), 1);
    });

    it('should create dictionary from multiple readers', async () => {
        const reader1 = createReaderStub();
        reader1.read.resolves();
        reader1.next
            .onFirstCall().returns('hello')
            .onSecondCall().returns('world')
            .returns(undefined);
        const reader2 = createReaderStub();
        reader2.read.resolves();
        reader2.next
            .onFirstCall().returns('love')
            .onSecondCall().returns('world')
            .returns(undefined);

        const dictionaryBuiler = new DictionaryBuilder();
        await dictionaryBuiler.add(reader1);
        await dictionaryBuiler.add(reader2);
        const dictionary = dictionaryBuiler.build();

        assert.equal(dictionary.size, 3);
        assert.equal(dictionary.order('hello'), 0);
        assert.equal(dictionary.order('world'), 1);
        assert.equal(dictionary.order('love'), 2);
    });
});
