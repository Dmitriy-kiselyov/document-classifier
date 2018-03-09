'use strict';

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
