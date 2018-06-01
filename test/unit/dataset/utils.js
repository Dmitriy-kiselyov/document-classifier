'use strict';

const fs = require('fs-extra');
const path = require('path');

const utils = require('lib/dataset/utils');

describe('dataset/utils', () => {
    const sandbox = sinon.createSandbox();

    afterEach(() => sandbox.restore());

    it('get files', async () => {
        sandbox.stub(fs, 'readdir').withArgs('folder').resolves(['file1', 'subfolder', 'file2']);
        sandbox.stub(path, 'resolve').callsFake((folder, file) => `${folder}/${file}`);
        sandbox.stub(fs, 'stat')
            .withArgs('folder/file1').resolves({isFile: () => true})
            .withArgs('folder/file2').resolves({isFile: () => true})
            .withArgs('folder/subfolder').resolves({isFile: () => false});

        const files = await utils.getFiles('folder');

        assert.deepEqual(files, ['folder/file1', 'folder/file2']);
    });

    it('get folders', async () => {
        sandbox.stub(fs, 'readdir').withArgs('folder').resolves(['subfolder1', 'file', 'subfolder2']);
        sandbox.stub(path, 'resolve').callsFake((folder, file) => `${folder}/${file}`);
        sandbox.stub(fs, 'stat')
            .withArgs('folder/subfolder1').resolves({isDirectory: () => true})
            .withArgs('folder/subfolder2').resolves({isDirectory: () => true})
            .withArgs('folder/file').resolves({isDirectory: () => false});

        const files = await utils.getFolders('folder');

        assert.deepEqual(files, ['folder/subfolder1', 'folder/subfolder2']);
    });

    it('split files', () => {
        sandbox.stub(Math, 'random')
            .onFirstCall().returns(0.4)
            .onSecondCall().returns(0.6)
            .onThirdCall().returns(0.3);

        const files = ['hello', 'world', '!'];
        const [classifiedFiles, trainingFiles] = utils.splitFiles(files, 0.5);

        assert.deepEqual(classifiedFiles, ['hello', '!']);
        assert.deepEqual(trainingFiles, ['world']);
    });

    it('moveLastFile', () => {
        const from = ['hello', 'world'];
        const to = ['goodbye'];
        utils.moveLastFile(from, to);

        assert.deepEqual(from, ['hello']);
        assert.deepEqual(to, ['goodbye', 'world']);
    });
});
