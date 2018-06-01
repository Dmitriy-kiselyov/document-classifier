'use strict';

const Promise = require('bluebird');
const path = require('path');

const Data = require('./data');
const utils = require('./utils');

module.exports = class Index {
    constructor() {
        this._dataset = new Map();
    }

    add(category, trainingSet, testSet) {
        this.addTrainingSet(category, trainingSet);
        this.addTestSet(category, testSet);
    }

    addTrainingSet(category, trainingSet) {
        assertName(category);
        this._getOrCreate(category).addTrainingSet(trainingSet);
    }

    addTestSet(category, testSet) {
        assertName(category);
        this._getOrCreate(category).addTestSet(testSet);
    }

    _getOrCreate(category) {
        if (!this._dataset.has(category)) {
            this._dataset.set(category, new Data());
        }
        return this._dataset.get(category);
    }

    getTrainingSet(category) {
        return this._dataset.has(category) ? this._dataset.get(category).trainingSet : null;
    }

    getTestSet(category) {
        return this._dataset.has(category) ? this._dataset.get(category).testSet : null;
    }

    get categories() {
        return Array.from(this._dataset.keys());
    }

    validate() {
        if (this._dataset.size === 0) {
            throw new Error('Validation failed: no sets found');
        }

        for (let [category, data] of this._dataset.entries()) {
            try {
                data.validate();
            } catch ({message}) {
                throw new Error(`Validation failed for "${category}": ${message}`);
            }
        }
    }

    static async createAndSplit(folders, rate) {
        const dataset = new Index();

        await Promise.map(folders, async (folder) => {
            const files = await utils.getFiles(folder);
            const data = Data.createAndSplit(files, rate);

            dataset._dataset.set(folder, data);
        });

        return dataset;
    }

    static async createFromSplit(training, test) {
        const dataset = new Index();

        const iterate = async (root, func) => {
            const subFolders = await utils.getFolders(root);
            await Promise.map(subFolders, async (folder) => {
                const files = await utils.getFiles(folder);
                dataset[func](path.basename(folder), files);
            });
        };

        await Promise.all([
            iterate(training, 'addTrainingSet'),
            iterate(test, 'addTestSet')
        ]);
        return dataset;
    }
};

function assertName(name) {
    if (typeof name !== 'string') {
        throw new Error('Class name should be a string');
    }
    if (name.trim() === '') {
        throw new Error('Class name should not be empty');
    }
}
