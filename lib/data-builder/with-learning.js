'use strict';

const Promise = require('bluebird');

const BaseDataBuilder = require('./base-builder');
const readerCache = require('../reader-cache');
const Neuron = require('../neuron');
const {shuffle} = require('./utils');
const logger = require('../logger');

module.exports = class DataBuilderWithLearning extends BaseDataBuilder {
    async _prepareNeuron(files, category) {
        const createMethod = this._config.randomWeights ? Neuron.createRandom : Neuron.createEqual;
        const neuron = createMethod(this._dictionary.size);

        let iterations = this._config.learningIterations;
        while (iterations-- !== 0) {
            await this._iteration(neuron, shuffle(files));

            if (iterations) {
                logger.get().neuronIteration(category, iterations);
            }
        }

        return neuron;
    }

    async _iteration(neuron, files) {
        await Promise.map(files, async (file) => {
            const reader = readerCache.get(file);
            const {id, maskBuilder} = await this._maskBuilderPool.get(this._dictionary);

            await maskBuilder.add(reader);
            neuron.teach(maskBuilder.build(), this._config.learningRate);
            this._maskBuilderPool.release(id);
        });
    }
};
