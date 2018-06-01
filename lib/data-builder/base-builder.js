'use strict';

const Promise = require('bluebird');

const Config = require('../config');
const readerCache = require('../reader-cache');
const DictionaryBuilder = require('../dictionary-builder');
const DictionaryFilter = require('../dictionary-builder/dictionary-filter');
const MaskBuilderPool = require('../pool/mask-builder-pool');
let logger = require('../logger');

module.exports = class BaseDataBuilder {
    constructor(dataset) {
        this._dataset = dataset;
        this._dictionary = null;
        this._neurons = null;

        this._config = Config.get();
        logger = logger.get();
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
            this._neurons[category] = await this._prepareNeuron(trainingSet, category);
            logger.neuronReady(category);
        });
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
