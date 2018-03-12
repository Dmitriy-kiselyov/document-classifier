'use strict';

const NO_LETTERS = (word) => {
    return word.length > 1;
};

const NO_DIGITS = (word) => {
    for (let char of word) {
        if ('123456789'.includes(char)) {
            return false;
        }
    }
    return true;
};

module.exports.NO_LETTERS = NO_LETTERS;
module.exports.NO_DIGITS = NO_DIGITS;
module.exports.all = () => [NO_LETTERS, NO_DIGITS];
