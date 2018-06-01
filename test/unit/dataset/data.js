'use strict';

const Data = require('lib/dataset/data');
const utils = require('lib/dataset/utils');

describe('dataset/data', () => {
    const sandbox = sinon.createSandbox();

    afterEach(() => sandbox.restore());

    describe('should throw', () => {
        it('if training set is not an array', () => {
            const data = new Data();

            assert.throws(() => data.addTrainingSet('  ', 'not-an-array'), 'Training set should be an array of strings');
        });

        it('if training set is not an array of strings', () => {
            const data = new Data();

            assert.throws(() => data.addTrainingSet('  ', ['file1', 1, 'file2']), 'Training set should be an array of strings');
        });

        it('if test set is not an array', () => {
            const data = new Data();

            assert.throws(() => data.addTestSet('  ', 'not-an-array'), 'Test set should be an array of strings');
        });

        it('if test set is not an array of strings', () => {
            const data = new Data();

            assert.throws(() => data.addTestSet('  ', ['file1', 1, 'file2']), 'Test set should be an array of strings');
        });
    });

    it('should add training files', () => {
        const data = new Data();
        data.addTrainingSet(['a']);
        data.addTrainingSet(['b', 'c']);

        assert.deepEqual(data.trainingSet, ['a', 'b', 'c']);
    });

    it('should add test files', () => {
        const data = new Data();
        data.addTestSet(['a']);
        data.addTestSet(['b', 'c']);

        assert.deepEqual(data.testSet, ['a', 'b', 'c']);
    });

    describe('validate', () => {
        it('should fail if training set is empty', () => {
            const data = new Data();
            data.addTestSet(['a']);

            assert.throws(() => data.validate(), 'training set is empty!');
        });

        it('should fail if test set is empty', () => {
            const data = new Data();
            data.addTrainingSet(['a']);

            assert.throws(() => data.validate(), 'test set is empty!');
        });

        it('should success if sets are not empty', () => {
            const data = new Data();
            data.addTrainingSet(['a']);
            data.addTestSet(['b']);

            assert.doesNotThrow(() => data.validate());
        });
    });

    describe('createAndSplit', () => {
        describe('should throw if "files"', () => {
            const shouldThrow = (files, errorMassage) => {
                const createAndSplit = () => Data.createAndSplit(files, 0.5);
                assert.throws(createAndSplit, Error, errorMassage);
            };

            it('is not array', () => {
                shouldThrow('not-an-array', 'Files should be an array of strings');
            });

            it('is not array of strings', () => {
                shouldThrow(['file1', 15, 'file2'], 'Files should be an array of strings');
            });

            it('has length less then 2', () => {
                shouldThrow(['file1'], 'Files should contain at least 2 file paths');
            });
        });

        it('should split files by rate', () => {
            sandbox.stub(utils, 'splitFiles').returns([['file1'], ['file2', 'file3']]);

            const dataset = Data.createAndSplit(['file1', 'file2', 'file3'], 0.5);

            assert.calledOnceWith(utils.splitFiles, ['file1', 'file2', 'file3'], 0.5);
            assert.deepEqual(dataset.trainingSet, ['file1']);
            assert.deepEqual(dataset.testSet, ['file2', 'file3']);
        });

        it('should split files by rate even if rate is very small', () => {
            sandbox.stub(utils, 'splitFiles').returns([[], ['file1', 'file2', 'file3']]);

            const dataset = Data.createAndSplit(['file1', 'file2', 'file3'], 0.1);

            assert.calledOnceWith(utils.splitFiles, ['file1', 'file2', 'file3'], 0.1);
            assert.deepEqual(dataset.trainingSet, ['file3']);
            assert.deepEqual(dataset.testSet, ['file1', 'file2']);
        });

        it('should split files by rate even if rate is very big', () => {
            sandbox.stub(utils, 'splitFiles').returns([['file1', 'file2', 'file3'], []]);

            const dataset = Data.createAndSplit(['file1', 'file2', 'file3'], 0.9);

            assert.calledOnceWith(utils.splitFiles, ['file1', 'file2', 'file3'], 0.9);
            assert.deepEqual(dataset.trainingSet, ['file1', 'file2']);
            assert.deepEqual(dataset.testSet, ['file3']);
        });
    });
});
