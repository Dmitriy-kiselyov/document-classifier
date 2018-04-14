'use strict';

const Promise = require('bluebird');

const Data = require('./data');
const readerCache = require('../reader-cache');
const DictionaryBuilder = require('../dictionary-builder');
const DictionaryFilter = require('../dictionary-builder/dictionary-filter');
const MaskBuilder = require('../mask-builder');
const Neuron = require('../neuron');
const {getFiles} = require('./utils');

module.exports = class Dataset {
    constructor(folders, rate) {
        this._folders = folders;
        this._rate = rate;

        this._dictionary = null;
        this._data = null;
        this._neurons = null;
    }

    async prepare() {
        await this._prepareData();

        await this._prepareDictionary();
        console.log('Dictionary ready; size =', this._dictionary.size);
        await this._prepareNeurons();
        readerCache.clean();

        return this._neurons;
    }

    async _prepareData() {
        this._data = {};

        await Promise.map(this._folders, async (folder) => {
            this._data[folder] = await this._prepareDataFromFolder(folder);
        });
    }

    async _prepareDataFromFolder(folder) {
        const files = await getFiles(folder);
        return Data.createAndSplit(files, this._rate);
    }

    async _prepareDictionary() {
        const commonDictionaryBuilder = new DictionaryBuilder();

        const dictionaries = await Promise.map(this._folders, async (folder) => {
            const files = this._data[folder].classifiedFiles;

            const folderDictionaryBuilder = new DictionaryBuilder();
            await Promise.map(files, async (file) => {
                const reader = readerCache.get(file);
                await folderDictionaryBuilder.add(reader);
                await commonDictionaryBuilder.add(reader);
            });

            return folderDictionaryBuilder.build();
        });

        this._dictionary = this._filterDictionary(commonDictionaryBuilder.build(), dictionaries);
    }

    _filterDictionary(commonDictionary, dictionaries) {
        const commonWordsFilter = DictionaryFilter.createCommonWordsFilter(commonDictionary, dictionaries);
        const countFilter = DictionaryFilter.createCountFilter(3);
        return DictionaryFilter.filter(commonDictionary, countFilter, commonWordsFilter);
    }

    async _prepareNeurons() {
        this._neurons = {};

        await Promise.map(this._folders, async (folder) => {
            const data = this._data[folder];
            this._neurons[folder] = await this._prepareNeuron(data.classifiedFiles);
            console.log('Neuron prepared', folder);
        });
    }

    async _prepareNeuron(files) {
        const maskBuilder = new MaskBuilder(this._dictionary);

        await Promise.map(files, async (file) => {
            const reader = readerCache.get(file);
            await maskBuilder.add(reader);
        });

        const mask = maskBuilder.build();
        return new Neuron(mask);
    }

    get folders() {
        return this._folders;
    }

    get rate() {
        return this._rate;
    }

    get dictionary() {
        return this._dictionary;
    }

    get data() {
        return this._data;
    }

    get neurons() {
        return this._neurons;
    }
};
