'use strict';

const _ = require('lodash');
const stemmer = require('stemmer');

const TO_LOWER_CASE = (word) => {
    return word.toLowerCase();
};

const TRIM = (word) => {
    const delim = '_.:-?!`"\'~#;*^';
    return _.trim(word, delim);
};

const STEM = stemmer;

module.exports.TO_LOWER_CASE = TO_LOWER_CASE;
module.exports.TRIM = TRIM;
module.exports.STEM = STEM;
module.exports.all = () => [TO_LOWER_CASE, TRIM, STEM];
