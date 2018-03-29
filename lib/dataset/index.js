'use strict';

const Promise = require('bluebird');

const Data = require('./data');
const readerCache = require('../reader-cache');
const DictionaryBuilder = require('../dictionary-builder');
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

        const classifiedFiles = [].concat(...this._folders.map((folder) => this._data[folder].classifiedFiles));
        await this._prepareDictionary(classifiedFiles);

        await this._prepareNeurons();
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

    async _prepareDictionary(files) {
        const dictionaryBuilder = new DictionaryBuilder();
        await Promise.map(
            files.map((file) => readerCache.get(file)),
            (reader) => dictionaryBuilder.add(reader)
        );

        this._dictionary = dictionaryBuilder.build();
    }

    async _prepareNeurons() {
        this._neurons = {};

        await Promise.map(this._folders, async (folder) => {
            const data = this._data[folder];
            this._neurons[folder] = await this._prepareNeuron(data.classifiedFiles);
        });
    }

    async _prepareNeuron(files) {
        const maskBuilder = new MaskBuilder(this._dictionary);

        await Promise.map(files, (file) => {
            const reader = readerCache.get(file);
            maskBuilder.add(reader);
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
