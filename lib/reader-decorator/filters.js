'use strict';

module.exports.NO_LETTERS = (word) => {
    return word.length > 1;
};

const DIGITS = '123456789';
module.exports.NO_DIGITS = (word) => {
    for (let char of word) {
        if (DIGITS.includes(char)) {
            return false;
        }
    }
    return true;
};
