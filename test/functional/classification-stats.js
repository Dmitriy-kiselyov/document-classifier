'use strict';

const Promise = require('bluebird');

const Classifier = require('../../lib/classifier');
const utils = require('./utils');

const root = 'C:\\Users\\dmitr\\Desktop\\20_newsgroup';

const main = async (rate) => {
    console.time('classification');

    const classifier = new Classifier();
    const folders = await utils.getSubfolders(root);

    await classifier.prepare(folders, rate);
    console.log('Prepare complete');

    await Promise.map(folders, async (folder) => {
        const ans = await classifier.test(folder);
        console.log(folder, ans);
    });

    console.timeEnd('classification');
};

main(0.8);
