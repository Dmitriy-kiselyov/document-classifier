'use strict';

const utils = require('./utils');

module.exports = class Data {
    static create() {
        return new Data();
    }

    constructor() {
        this._trainingSet = [];
        this._testSet = [];
    }

    addTrainingSet(files) {
        assertFiles('Training set', files);
        this._trainingSet.push(...files);
    }

    addTestSet(files) {
        assertFiles('Test set', files);
        this._testSet.push(...files);
    }

    get trainingSet() {
        return this._trainingSet;
    }

    get testSet() {
        return this._testSet;
    }

    validate() {
        assertEmptySet('training', this._trainingSet);
        assertEmptySet('test', this._testSet);
    }

    static createAndSplit(files, rate) {
        assertFiles('Files', files);
        if (files.length < 2) {
            throw new Error('Files should contain at least 2 file paths');
        }

        const [trainingFiles, testFiles] = utils.splitFiles(files, rate);
        if (testFiles.length === 0) {
            utils.moveLastFile(trainingFiles, testFiles);
        } else if (trainingFiles.length === 0) {
            utils.moveLastFile(testFiles, trainingFiles);
        }

        const data = new Data();
        data.addTrainingSet(trainingFiles);
        data.addTestSet(testFiles);
        return data;
    }
};

function assertFiles(name, files) {
    if (!isArrayOfStrings(files)) {
        throw new Error(`${name} should be an array of strings`);
    }
}

function isArrayOfStrings(files) {
    return Array.isArray(files) &&
        files.every((file) => typeof file === 'string');
}

function assertEmptySet(name, files) {
    if (files.length === 0) {
        throw new Error(`${name} set is empty!`);
    }
}
