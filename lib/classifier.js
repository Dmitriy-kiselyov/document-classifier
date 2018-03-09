'use strict';

const path = require('path');
const fs = require('fs-extra');
const Promise = require('bluebird');

const Dataset = require('./dataset');

class Classifier {
    async prepareDataset(folder, rate) {
        let files = await fs.readdir(folder);
        files.forEach((file, i) => files[i] = path.resolve(folder, file));

        files = await Promise.filter(files, (file) => {
            return fs.stat(file)
                .then((file) => file.isFile());
        });

        return Dataset.createAndSplit(files, rate);
    }
}

module.exports = Classifier;
