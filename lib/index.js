'use strict';

const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');

const Classifier = require('./classifier');

const root = 'C:\\Users\\dmitr\\Desktop\\20_newsgroup';
const classifier = new Classifier();

const getSubfolders = async (root) => {
    const folders = await fs.readdir(root);
    return folders.map((folder) => path.resolve(root, folder));
};

const f = async () => {
    const folders = await getSubfolders(root);

    await classifier.prepare(folders, 0.8);
    console.log('Prepare complete');

    await Promise.map(folders, async (folder) => {
        const ans = await classifier.test(folder);
        console.log(folder, ans);
    });
};

console.time('classification');
f().then(() => console.timeEnd('classification'));
