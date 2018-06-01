'use strict';

const Promise = require('bluebird');

const BaseDataBuilder = require('./base-builder');
const MaskBuilder = require('../mask-builder');
const readerCache = require('../reader-cache');
const Neuron = require('../neuron');

module.exports = class DataBuilderWithoutLearning extends BaseDataBuilder {
    async _prepareNeuron(files) {
        const maskBuilder = new MaskBuilder(this._dictionary);

        await Promise.map(files, async (file) => {
            const reader = readerCache.get(file);
            await maskBuilder.add(reader);
        });

        const mask = maskBuilder.build();
        return new Neuron(mask);
    }
};
