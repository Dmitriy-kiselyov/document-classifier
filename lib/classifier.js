'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

const Dataset = require('./dataset');
const MaskBuilderPool = require('./pool/mask-builder-pool');
const readerCache = require('./reader-cache');

module.exports = class Classifier {
    constructor() {
        this._dataset = null;
        this._maskBuilderPool = new MaskBuilderPool(65536000); //500mb
    }

    async prepare(folders, rate) {
        this._dataset = new Dataset(folders, rate);
        await this._dataset.prepare();
    }

    async recognize(file) {
        const neurons = this._dataset.neurons;
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
        const data = this._dataset.data[folder];

        let yes = 0;
        await Promise.map(data.trainingFiles, async (file) => {
            const max = await this.recognize(file);
            yes += max.name === folder ? 1 : 0;
        });

        const no = data.trainingFiles.length - yes;
        return {yes, no};
    }

    async _buildMask(file) {
        const {id, maskBuilder} = await this._maskBuilderPool.get(this._dataset.dictionary);
        await maskBuilder.add(readerCache.get(file));
        return {mask: maskBuilder.build(), id};
    }
};
