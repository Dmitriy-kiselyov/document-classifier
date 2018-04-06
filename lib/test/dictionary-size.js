/* eslint-disable no-unused-vars */
'use strict';

const fs = require('fs-extra');
const path = require('path');

const DictionaryBuilder = require('../dictionary-builder');
const readerCache = require('../reader-cache');
const Classifier = require('../classifier');
const utils = require('./utils');

const root = 'C:\\Users\\dmitr\\Desktop\\20_newsgroup';
const desktop = 'C:\\Users\\dmitr\\Desktop';

// test1File(path.resolve(root, 'alt.atheism', '49960'), path.resolve(desktop, '49960.txt'));
testFolders(0.8, path.resolve(desktop, '20_newsgroup.txt'));

async function test1File(file, output) {
    const dictionaryBuilder = new DictionaryBuilder();
    const reader = readerCache.get(file);
    await dictionaryBuilder.add(reader);
    const dictionary = dictionaryBuilder.build();

    await printDictionary(dictionary, output);
}

async function testFolders(rate, output) {
    console.time('prepare dictionary');

    const classifier = new Classifier();
    const folders = await utils.getSubfolders(root);

    await classifier.prepare(folders, rate);
    console.timeEnd('prepare dictionary');

    await printDictionary(classifier.dataset.dictionary, output);
}

async function printDictionary(dictionary, output) {
    if (output) {
        const message = `SIZE = ${dictionary.size}\r\n${dictionary.words.join('\r\n')}`;
        await fs.writeFile(output, message);
        console.log('DONE');
    } else {
        console.log('SIZE = ', dictionary.size);
        console.log(dictionary.words);
    }
}
