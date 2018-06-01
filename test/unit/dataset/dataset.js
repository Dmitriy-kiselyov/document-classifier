'use strict';

const Dataset = require('lib/dataset');
const Data = require('lib/dataset/data');
const utils = require('lib/dataset/utils');

describe('dataset', () => {
    const sandbox = sinon.createSandbox();

    afterEach(() => sandbox.restore());

    describe('should throw', () => {
        it('if class is not a string', () => {
            const dataset = new Dataset();

            assert.throws(() => dataset.add(12, [], []), 'Class name should be a string');
        });

        it('if class is empty', () => {
            const dataset = new Dataset();

            assert.throws(() => dataset.add('  ', [], []), 'Class name should not be empty');
        });
    });

    it('method "add" should call child methods', () => {
        const dataset = new Dataset();
        sandbox.spy(dataset, 'addTrainingSet');
        sandbox.spy(dataset, 'addTestSet');

        dataset.add('class', ['a'], ['b']);

        assert.calledOnceWith(dataset.addTrainingSet, 'class', ['a']);
        assert.calledOnceWith(dataset.addTestSet, 'class', ['b']);
    });

    it('should add training files', () => {
        const dataset = new Dataset();
        dataset.addTrainingSet('class1', ['a']);
        dataset.addTrainingSet('class2', ['b']);
        dataset.addTrainingSet('class1', ['c']);

        assert.deepEqual(dataset.getTrainingSet('class1'), ['a', 'c']);
        assert.deepEqual(dataset.getTrainingSet('class2'), ['b']);
    });

    it('should add test files', () => {
        const dataset = new Dataset();
        dataset.addTestSet('class1', ['a']);
        dataset.addTestSet('class2', ['b']);
        dataset.addTestSet('class1', ['c']);

        assert.deepEqual(dataset.getTestSet('class1'), ['a', 'c']);
        assert.deepEqual(dataset.getTestSet('class2'), ['b']);
    });

    it('should get categories', () => {
        const dataset = new Dataset();
        dataset.addTrainingSet('class1', ['a']);
        dataset.addTestSet('class1', ['b']);
        dataset.addTrainingSet('class2', ['c']);
        dataset.addTestSet('class3', ['d']);

        assert.deepEqual(dataset.categories, ['class1', 'class2', 'class3']);
    });

    it('should return "null" if class was not defined', () => {
        const dataset = new Dataset();

        assert.equal(dataset.getTrainingSet('class'), null);
    });

    describe('validate', () => {
        const buildMessage = (className, set) => {
            return `Validation failed for "${className}": ${set} set is empty!`;
        };

        it('should fail if has empty training set', () => {
            const dataset = new Dataset();
            dataset.addTestSet('class1', ['a']);

            assert.throws(() => dataset.validate(), buildMessage('class1', 'training'));
        });

        it('should fail if has empty test set', () => {
            const dataset = new Dataset();
            dataset.addTrainingSet('class1', ['a']);
            dataset.addTestSet('class1', ['b']);
            dataset.addTrainingSet('class2', ['c']);

            assert.throws(() => dataset.validate(), buildMessage('class2', 'test'));
        });

        it('should fail if no data found at all', () => {
            const dataset = new Dataset();

            assert.throws(() => dataset.validate(), 'Validation failed: no sets found');
        });

        it('should success if no empty sets found', () => {
            const dataset = new Dataset();
            dataset.addTrainingSet('class1', ['a']);
            dataset.addTestSet('class1', ['b']);

            assert.doesNotThrow(() => dataset.validate());
        });
    });

    it('createAndSplit', async () => {
        const newData = (training, test) => {
            const data = new Data();
            data.addTrainingSet(training);
            data.addTestSet(test);
            return data;
        };

        sandbox.stub(utils, 'getFiles')
            .withArgs('folder1').resolves(['folder1/file1', 'folder1/file2'])
            .withArgs('folder2').resolves(['folder2/file3', 'folder2/file4', 'folder2/file5']);
        sandbox.stub(Data, 'createAndSplit')
            .withArgs(['folder1/file1', 'folder1/file2'], 0.5).returns(newData(['folder1/file1'], ['folder1/file2']))
            .withArgs(['folder2/file3', 'folder2/file4', 'folder2/file5'], 0.5).returns(newData(['folder2/file3', 'folder2/file5'], ['folder2/file4']));

        const dataset = await Dataset.createAndSplit(['folder1', 'folder2'], 0.5);

        assert.deepEqual(dataset.getTrainingSet('folder1'), ['folder1/file1']);
        assert.deepEqual(dataset.getTestSet('folder1'), ['folder1/file2']);
        assert.deepEqual(dataset.getTrainingSet('folder2'), ['folder2/file3', 'folder2/file5']);
        assert.deepEqual(dataset.getTestSet('folder2'), ['folder2/file4']);
    });

    it('createFromSplit', async () => {
        sandbox.stub(utils, 'getFolders')
            .withArgs('training').resolves(['training/folder1', 'training/folder2'])
            .withArgs('test').resolves(['test/folder1', 'test/folder2']);
        sandbox.stub(utils, 'getFiles')
            .withArgs('training/folder1').resolves(['training/folder1/file1'])
            .withArgs('training/folder2').resolves(['training/folder2/file2'])
            .withArgs('test/folder1').resolves(['test/folder1/file11'])
            .withArgs('test/folder2').resolves(['test/folder2/file22']);

        const dataset = await Dataset.createFromSplit('training', 'test');

        assert.deepEqual(dataset.getTrainingSet('folder1'), ['training/folder1/file1']);
        assert.deepEqual(dataset.getTrainingSet('folder2'), ['training/folder2/file2']);
        assert.deepEqual(dataset.getTestSet('folder1'), ['test/folder1/file11']);
        assert.deepEqual(dataset.getTestSet('folder2'), ['test/folder2/file22']);
    });
});
