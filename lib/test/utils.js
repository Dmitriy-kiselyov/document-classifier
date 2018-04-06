'use strict';

const fs = require('fs-extra');
const path = require('path');

async function getSubfolders(root) {
    const folders = await fs.readdir(root);
    return folders.map((folder) => path.resolve(root, folder));
}

module.exports.getSubfolders = getSubfolders;
