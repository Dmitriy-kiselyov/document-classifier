'use strict';

const utils = require('lib/dataset/utils');

describe('dataset/utils', () => {
    const sandbox = sinon.createSandbox();

    afterEach(() => sandbox.restore());

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
