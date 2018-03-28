'use strict';

const utils = require('./utils');

module.exports = class Data {
    static createAndSplit(files, rate) {
        validate(files, 'Files');
        if (files.length < 2) {
            throw new Error('Files must contain at least 2 file paths');
        }

        const [classifiedFiles, trainingFiles] = utils.splitFiles(files, rate);
        if (classifiedFiles.length === 0) {
            utils.moveLastFile(trainingFiles, classifiedFiles);
        } else if (trainingFiles.length === 0) {
            utils.moveLastFile(classifiedFiles, trainingFiles);
        }

        return Data.create(classifiedFiles, trainingFiles);
    }

    static create(classifiedFiles, trainingFiles) {
        return new Data(classifiedFiles, trainingFiles);
    }

    constructor(classifiedFiles, trainingFiles) {
        validate(classifiedFiles, 'Classified files');
        validate(trainingFiles, 'Training files');

        this._classifiedFiles = classifiedFiles;
        this._trainingFiles = trainingFiles;
    }

    get classifiedFiles() {
        return this._classifiedFiles;
    }

    get trainingFiles() {
        return this._trainingFiles;
    }
};

function validate(files, name) {
    if (!isArrayOfStrings(files)) {
        throw new Error(`${name} must be array of strings`);
    }
}

function isArrayOfStrings(files) {
    return Array.isArray(files) &&
        files.length !== 0 &&
        files.every((file) => typeof file === 'string');
}