'use strict';

const Data = require('lib/dataset/data');
const utils = require('lib/dataset/utils');

describe('dataset', () => {
    const sandbox = sinon.createSandbox();

    afterEach(() => sandbox.restore());

    describe('create', () => {
        const shouldThrow = (classifiedFiles, trainingFiles, errorMassage) => {
            const constructor = () => new Data(classifiedFiles, trainingFiles);
            assert.throws(constructor, Error, errorMassage);
        };

        describe('should throw if "classifiedFiles" is', () => {
            const errorMassage = 'Classified files must be array of strings';
            let trainingFiles = ['file'];

            it('not array', () => {
                shouldThrow('not-an-array', trainingFiles, errorMassage);
            });

            it('empty', () => {
                shouldThrow([], trainingFiles, errorMassage);
            });

            it('not array of strings', () => {
                shouldThrow(['file1', 15, 'file2'], trainingFiles, errorMassage);
            });
        });

        describe('should throw if "trainingFiles" is', () => {
            const errorMassage = 'Training files must be array of strings';
            let classifiedFiles = ['file'];

            it('not array', () => {
                shouldThrow(classifiedFiles, 'not-an-array', errorMassage);
            });

            it('empty', () => {
                shouldThrow(classifiedFiles, [], errorMassage);
            });

            it('not array of strings', () => {
                shouldThrow(classifiedFiles, ['file1', 15, 'file2'], errorMassage);
            });
        });

        it('should accept files', () => {
            const dataset = Data.create(['file1'], ['file2', 'file3']);

            assert.deepEqual(dataset.classifiedFiles, ['file1']);
            assert.deepEqual(dataset.trainingFiles, ['file2', 'file3']);
        });
    });

    describe('createAndSplit', () => {
        describe('should throw if "files"', () => {
            const shouldThrow = (files, errorMassage) => {
                const createAndSplit = () => Data.createAndSplit(files, 0.5);
                assert.throws(createAndSplit, Error, errorMassage);
            };

            it('is not array', () => {
                shouldThrow('not-an-array', 'Files must be array of strings');
            });

            it('is empty', () => {
                shouldThrow([], 'Files must be array of strings');
            });

            it('is not array of strings', () => {
                shouldThrow(['file1', 15, 'file2'], 'Files must be array of strings');
            });

            it('has length less then 2', () => {
                shouldThrow(['file1'], 'Files must contain at least 2 file paths');
            });
        });

        it('should split files by rate', () => {
            sandbox.stub(utils, 'splitFiles').returns([['file1'], ['file2', 'file3']]);

            const dataset = Data.createAndSplit(['file1', 'file2', 'file3'], 0.5);

            assert.calledOnceWith(utils.splitFiles, ['file1', 'file2', 'file3'], 0.5);
            assert.deepEqual(dataset.classifiedFiles, ['file1']);
            assert.deepEqual(dataset.trainingFiles, ['file2', 'file3']);
        });

        it('should split files by rate even if rate is very small', () => {
            sandbox.stub(utils, 'splitFiles').returns([[], ['file1', 'file2', 'file3']]);

            const dataset = Data.createAndSplit(['file1', 'file2', 'file3'], 0.1);

            assert.calledOnceWith(utils.splitFiles, ['file1', 'file2', 'file3'], 0.1);
            assert.deepEqual(dataset.classifiedFiles, ['file3']);
            assert.deepEqual(dataset.trainingFiles, ['file1', 'file2']);
        });

        it('should split files by rate even if rate is very big', () => {
            sandbox.stub(utils, 'splitFiles').returns([['file1', 'file2', 'file3'], []]);

            const dataset = Data.createAndSplit(['file1', 'file2', 'file3'], 0.9);

            assert.calledOnceWith(utils.splitFiles, ['file1', 'file2', 'file3'], 0.9);
            assert.deepEqual(dataset.classifiedFiles, ['file1', 'file2']);
            assert.deepEqual(dataset.trainingFiles, ['file3']);
        });
    });
});
