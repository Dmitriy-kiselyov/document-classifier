'use strict';

const NO_LETTERS = (word) => {
    return word.length > 1;
};

const ENGLISH = (word) => {
    return /^[A-Za-z]([-_'&]?[A-Za-z])*$/.test(word);
};

module.exports.NO_LETTERS = NO_LETTERS;
module.exports.ENGLISH = ENGLISH;
module.exports.all = () => [NO_LETTERS, ENGLISH];
