'use strict';

const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');

const Classifier = require('../classifier');

const root = 'C:\\Users\\dmitr\\Desktop\\20_newsgroup';

const main = async (rate) => {
    console.time('classification');

    const classifier = new Classifier();
    const folders = await getSubfolders(root);

    await classifier.prepare(folders, rate);
    console.log('Prepare complete');

    await Promise.map(folders, async (folder) => {
        const ans = await classifier.test(folder);
        console.log(folder, ans);
    });

    console.timeEnd('classification');
};

main(0.8);

async function getSubfolders(root) {
    const folders = await fs.readdir(root);
    return folders.map((folder) => path.resolve(root, folder));
}
