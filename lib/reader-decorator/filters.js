'use strict';

const NO_LETTERS = (word) => {
    return word.length > 1;
};

const ENGLISH = (word) => {
    return /^[A-Za-z]([-_'&]?[A-Za-z])*$/.test(word);
};

const NO_ENGLISH_PRETEXT = (word) => {
    const pretexts = 'a the an this that there and or is to be are was were it in on at for of'.split(' ');
    return !pretexts.includes(word);
};

module.exports.NO_LETTERS = NO_LETTERS;
module.exports.ENGLISH = ENGLISH;
module.exports.NO_ENGLISH_PRETEXT = NO_ENGLISH_PRETEXT;
module.exports.all = () => [NO_LETTERS, ENGLISH, NO_ENGLISH_PRETEXT];
