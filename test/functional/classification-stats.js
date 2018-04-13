'use strict';

const Promise = require('bluebird');
const path = require('path');

const Classifier = require('../../lib/classifier');
const utils = require('./utils');

const root = 'C:\\Users\\dmitr\\Desktop\\20_newsgroup';

const printStats = (stats) => {
    const formatPercent = (yes, total) => {
        return Math.floor(yes / total * 100);
    };

    stats.forEach((test) => test.folder = path.basename(test.folder));
    stats.sort((test1, test2) => test1.folder.localeCompare(test2.folder));

    let yesSum = 0;
    let totalSum = 0;
    stats.forEach(({folder, stat}) => {
        const total = stat.yes + stat.no;
        const percent = formatPercent(stat.yes, total);

        yesSum += stat.yes;
        totalSum += total;

        console.log(folder, stat, `${percent}%`);
    });

    const percent = formatPercent(yesSum, totalSum);
    console.log(`Classification rate: ${percent}%`);
};

const main = async (rate) => {
    console.time('classification');

    const classifier = new Classifier();
    const folders = await utils.getSubfolders(root);

    await classifier.prepare(folders, rate);
    console.log('Prepare complete');

    const stats = [];
    await Promise.map(folders, async (folder) => {
        const stat = await classifier.test(folder);
        console.log(folder, stat);
        stats.push({folder, stat});
    });

    console.log('------------------------------');
    printStats(stats);
    console.timeEnd('classification');
};

main(0.8);
