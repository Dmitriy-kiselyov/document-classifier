'use strict';

const Promise = require('bluebird');

const Config = require('../config');
const readerCache = require('../reader-cache');
const DictionaryBuilder = require('../dictionary-builder');
const DictionaryFilter = require('../dictionary-builder/dictionary-filter');
const MaskBuilder = require('../mask-builder');
const MaskBuilderPool = require('../pool/mask-builder-pool');
const Neuron = require('../neuron');
const logger = require('../logger/logger');

module.exports = class DataBuilder {
    constructor(dataset) {
        this._dataset = dataset;
        this._dictionary = null;
        this._neurons = null;

        this._config = Config.get();
        this._maskBuilderPool = new MaskBuilderPool(this._config.poolSize);
    }

    async prepare() {
        await this.prepareDictionary();
        logger.dictionary(this._dictionary);

        await this._prepareNeurons();
        logger.neuronsReady();

        readerCache.clean();

        return this._neurons;
    }

    async prepareDictionary() {
        if (this._dictionary) {
            return this._dictionary;
        }

        const commonDictionaryBuilder = new DictionaryBuilder();

        const dictionaries = await Promise.map(this._dataset.categories, async (category) => {
            const files = this._dataset.getTrainingSet(category);

            const folderDictionaryBuilder = new DictionaryBuilder();
            await Promise.map(files, async (file) => {
                const reader = readerCache.get(file);
                await folderDictionaryBuilder.add(reader);
                await commonDictionaryBuilder.add(reader);
            });

            return folderDictionaryBuilder.build();
        });

        this._dictionary = this._filterDictionary(commonDictionaryBuilder.build(), dictionaries);
        return this._dictionary;
    }

    _filterDictionary(commonDictionary, dictionaries) {
        const {count, common} = this._config.dictionaryFilters;

        const commonWordsFilter = DictionaryFilter.createCommonWordsFilter(commonDictionary, dictionaries, common !== undefined ? common : dictionaries.length);
        const countFilter = DictionaryFilter.createCountFilter(count);
        return DictionaryFilter.filter(commonDictionary, countFilter, commonWordsFilter);
    }

    async _prepareNeurons() {
        this._neurons = {};

        await Promise.map(this._dataset.categories, async (category) => {
            const trainingSet = this._dataset.getTrainingSet(category);
            this._neurons[category] = await this._prepareNeuron(trainingSet);
            logger.neuronReady(category);
        });
    }

    // noinspection InfiniteRecursionJS
    async _prepareNeuron(files) {
        const createMethod = this._config.withLearning ? this._prepareNeuronWithLearning : this._prepareNeuronWithoutLearning;
        this._prepareNeuron = createMethod.bind(this);

        return await this._prepareNeuron(files);
    }

    async _prepareNeuronWithoutLearning(files) {
        const maskBuilder = new MaskBuilder(this._dictionary);

        await Promise.map(files, async (file) => {
            const reader = readerCache.get(file);
            await maskBuilder.add(reader);
        });

        const mask = maskBuilder.build();
        return new Neuron(mask);
    }

    async _prepareNeuronWithLearning(files) {
        const createMethod = this._config.randomWeights ? Neuron.createRandom : Neuron.createEqual;
        const neuron = createMethod(this._dictionary.size);

        await Promise.map(files, async (file) => {
            const reader = readerCache.get(file);
            const {id, maskBuilder} = await this._maskBuilderPool.get(this._dictionary);

            await maskBuilder.add(reader);
            neuron.teach(maskBuilder.build(), this._config.learningRate);
            this._maskBuilderPool.release(id);
        });

        return neuron;
    }

    get dictionary() {
        return this._dictionary;
    }

    get dataset() {
        return this._dataset;
    }

    get neurons() {
        return this._neurons;
    }
};
