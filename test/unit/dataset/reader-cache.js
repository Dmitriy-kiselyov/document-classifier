'use strict';

const readerCache = require('lib/dataset/reader-cache');
const ReaderFactory = require('lib/reader-factory');
const ReaderDecorator = require('lib/reader-decorator');
const transformers = require('lib/reader-decorator/transformers');
const filters = require('lib/reader-decorator/filters');

describe('dataset/reader-cache', () => {
    const sandbox = sinon.sandbox.create();

    const createReaderDecoratorStub = () => {
        return {
            addTransformers: sinon.stub(),
            addFilters: sinon.stub()
        };
    };

    beforeEach(() => {
        sandbox.stub(ReaderFactory, 'create').returns('READER');
        sandbox.stub(ReaderDecorator, 'create').callsFake(() => createReaderDecoratorStub());
        sandbox.stub(transformers, 'all').returns(['tr1', 'tr2']);
        sandbox.stub(filters, 'all').returns(['f1', 'f2']);
    });

    it('should create reader on first time', () => {
        readerCache.get('file.txt');

        assert.calledWith(ReaderFactory.create, 'file.txt');
    });

    it('should return reader decorator with all available transformers and filters', () => {
        const reader = readerCache.get('file.txt');

        assert.calledOnceWith(ReaderFactory.create, 'file.txt');
        assert.calledOnceWith(ReaderDecorator.create, 'READER');
        assert.callOrder(ReaderFactory.create, ReaderDecorator.create);
        assert.equal(reader, ReaderDecorator.create.getCall(0).returnValue);
        assert.calledOnceWith(reader.addTransformers, 'tr1', 'tr2');
        assert.calledOnceWith(reader.addFilters, 'f1', 'f2');
    });

    it('should return cached reader', () => {
        const reader1 = readerCache.get('file.txt');
        const reader2 = readerCache.get('file2.txt');
        const reader3 = readerCache.get('file.txt');

        assert.calledTwice(ReaderFactory.create);
        assert.equal(reader1, reader3);
        assert.notEqual(reader1, reader2);
    });

    it('should clean cache', () => {
        const reader1 = readerCache.get('file.txt');
        readerCache.clean();
        const reader2 = readerCache.get('file.txt');

        assert.notEqual(reader1, reader2);
    });
});
