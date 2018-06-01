'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

const Config = require('./config');
const DataBuilder = require('./data-builder');
const MaskBuilderPool = require('./pool/mask-builder-pool');
const readerCache = require('./reader-cache');

module.exports = class Classifier {
    constructor(dataset, config = {}) {
        dataset.validate();
        config = Config.create(config);

        this._dataset = dataset;
        this._dataBuilder = new (DataBuilder.get())(this._dataset);
        this._maskBuilderPool = new MaskBuilderPool(config.poolSize);
    }

    async prepare() {
        await this._dataBuilder.prepare();
    }

    async prepareDictionary() {
        await this._dataBuilder.prepareDictionary();
    }

    async recognize(file) {
        const neurons = this._dataBuilder.neurons;
        const {mask, id} = await this._buildMask(file);

        let max = {name: 'No name', probability: 0};
        _.forEach(neurons, (neuron, name) => {
            const probability = neuron.recognize(mask);
            if (probability > max.probability) {
                max = {name, probability};
            }
        });
        this._maskBuilderPool.release(id);

        return max;
    }

    async test(folder) {
        const testFiles = this._dataset.getTestSet(folder);

        let yes = 0;
        await Promise.map(testFiles, async (file) => {
            const max = await this.recognize(file);
            yes += max.name === folder ? 1 : 0;
        });

        const no = testFiles.length - yes;
        return {yes, no};
    }

    async _buildMask(file) {
        const {id, maskBuilder} = await this._maskBuilderPool.get(this.dictionary);
        await maskBuilder.add(readerCache.get(file));
        return {mask: maskBuilder.build(), id};
    }

    get dataset() {
        return this._dataset;
    }

    get dictionary() {
        return this._dataBuilder.dictionary;
    }
};
