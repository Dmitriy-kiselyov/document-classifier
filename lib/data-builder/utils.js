'use strict';

const path = require('path');
const fs = require('fs-extra');
const Promise = require('bluebird');

const filterContent = async (folder, filter) => {
    let files = await fs.readdir(folder);
    files.forEach((file, i) => files[i] = path.resolve(folder, file));

    files = await Promise.filter(files, (file) => {
        return fs.stat(file)
            .then(filter);
    });
    return files;
};

module.exports.getFiles = async (folder) => {
    return filterContent(folder, (stat) => stat.isFile());
};

module.exports.getFolders = async (folder) => {
    return filterContent(folder, (stat) => stat.isDirectory());
};

module.exports.splitFiles = (files, rate) => {
    const files1 = [];
    const files2 = [];

    files.forEach((file) => {
        if (Math.random() < rate) {
            files1.push(file);
        } else {
            files2.push(file);
        }
    });

    return [files1, files2];
};

module.exports.moveLastFile = (from, to) => {
    to.push(from.pop());
};
