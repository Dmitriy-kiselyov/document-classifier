'use strict';

const ReaderProxy = require('lib/reader-decorator');

const createReaderStub = () => {
    return {
        read: sinon.stub().named('read').resolves(['words']),
        next: sinon.stub().named('next')
    };
};

describe('reader-decorator', () => {
    let reader;
    let readerProxy;

    beforeEach(() => {
        reader = createReaderStub();
        readerProxy = new ReaderProxy(reader);
    });

    it('should pass read call to reader', () => {
        return readerProxy.read().then((words) => {
            assert.deepEqual(words, ['words']);
        });
    });

    it('should work without filters and transformers', () => {
        reader.next
            .onFirstCall().returns('word1')
            .onSecondCall().returns('word2')
            .returns(undefined);

        assert.equal(readerProxy.next(), 'word1');
        assert.equal(readerProxy.next(), 'word2');
        assert.equal(readerProxy.next(), undefined);
    });

    it('should apply transformers', () => {
        reader.next
            .onFirstCall().returns('word_')
            .onSecondCall().returns('another_')
            .returns(undefined);

        const trans1 = sinon.stub().callsFake((word) => word + 't1');
        const trans2 = sinon.stub().callsFake((word) => word + 't2');
        readerProxy.addTransformers(trans1, trans2);

        assert.equal(readerProxy.next(), 'word_t1t2');
        assert.equal(readerProxy.next(), 'another_t1t2');
        assert.equal(readerProxy.next(), undefined);
    });

    it('should trim after all transformers applied', () => {
        reader.next
            .onFirstCall().returns('word')
            .returns(undefined);

        const trans = sinon.stub().callsFake((word) => '  1' + word + '1  ');
        readerProxy.addTransformers(trans);

        assert.equal(readerProxy.next(), '1word1');
        assert.equal(readerProxy.next(), undefined);
    });

    it('should ignore empty words after transformers', () => {
        reader.next
            .onFirstCall().returns('word')
            .returns(undefined);

        const trans = sinon.stub().returns('   ');
        readerProxy.addTransformers(trans);

        assert.equal(readerProxy.next(), undefined);
    });

    it('should apply filters', () => {
        reader.next
            .onFirstCall().returns('word-1')
            .onSecondCall().returns('word-12')
            .onThirdCall().returns('word-2')
            .returns(undefined);

        const filter1 = sinon.stub().callsFake((word) => word.includes('1'));
        const filter2 = sinon.stub().callsFake((word) => word.includes('2'));
        readerProxy.addFilters(filter1, filter2);

        assert.equal(readerProxy.next(), 'word-12');
        assert.equal(readerProxy.next(), undefined);
    });

    it('should apply transformers then filters', () => {
        reader.next
            .onFirstCall().returns('word')
            .onSecondCall().returns('another')
            .returns(undefined);

        const trans = sinon.stub().callsFake((word) => word + '_1');
        const filter = sinon.stub().callsFake((word) => word !== 'word_1');
        readerProxy.addTransformers(trans);
        readerProxy.addFilters(filter);

        assert.equal(readerProxy.next(), 'another_1');
        assert.equal(readerProxy.next(), undefined);
    });
});
