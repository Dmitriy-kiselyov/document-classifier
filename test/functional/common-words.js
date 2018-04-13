'use strict';

const Promise = require('bluebird');

const DictionaryBuilder = require('../../lib/dictionary-builder');
const readerCache = require('../../lib/reader-cache');
const {getFiles} = require('../../lib/dataset/utils');
const {getSubfolders} = require('./utils');

const root = 'C:\\Users\\dmitr\\Desktop\\20_newsgroup';
main(root);

async function main(root) {
    let folders = await getSubfolders(root);

    const dictionaries = await Promise.map(folders, async (folder) => {
        const files = await getFiles(folder);
        return await prepareDictionary(files);
    });

    const words = [];
    dictionaries[0].words.forEach((word) => {
        for (let i = 1; i < dictionaries.length; i++) {
            if (!dictionaries[i].has(word)) {
                return;
            }
        }
        words.push(word);
    });

    console.log(words.join(' '));
}

async function prepareDictionary(files) {
    const dictionaryBuilder = new DictionaryBuilder();
    await Promise.map(files, async (file) => {
        const reader = readerCache.get(file);
        await dictionaryBuilder.add(reader);
    });

    return dictionaryBuilder.build();
}
