'use strict';

const fs = require('fs-extra');
const path = require('path');

const DictionaryBuilder = require('../dictionary-builder');
const readerCache = require('../reader-cache');

const root = 'C:\\Users\\dmitr\\Desktop\\20_newsgroup';
const desktop = 'C:\\Users\\dmitr\\Desktop';

const main = async (file, output) => {
    const dictionaryBuilder = new DictionaryBuilder();
    const reader = readerCache.get(file);
    await dictionaryBuilder.add(reader);
    const dictionary = dictionaryBuilder.build();

    if (output) {
        const message = `SIZE = ${dictionary.size}\r\n${dictionary.words.join('\r\n')}`;
        await fs.writeFile(output, message);
        console.log('DONE');
    } else {
        console.log('SIZE = ', dictionary.size);
        console.log(dictionary.words);
    }
};

main(path.resolve(root, 'alt.atheism', '49960'), path.resolve(desktop, '49960.txt'));
