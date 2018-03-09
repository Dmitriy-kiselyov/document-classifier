'use strict';

const utils = require('./utils');

module.exports = class Dataset {
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

        return Dataset.create(classifiedFiles, trainingFiles);
    }

    static create(classifiedFiles, trainingFiles) {
        return new Dataset(classifiedFiles, trainingFiles);
    }

    constructor(classifiedFiles, trainingFiles) {
        validate(classifiedFiles, 'Classified files');
        validate(trainingFiles, 'Training files');

        this.classifiedFiles = classifiedFiles;
        this.trainingFiles = trainingFiles;
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
