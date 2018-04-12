'use strict';

const _ = require('lodash');

const TO_LOWER_CASE = (word) => {
    return word.toLowerCase();
};

const TRIM = (word) => {
    const delim = '_.:-?!`"\'~#;*';
    return _.trim(word, delim);
};

module.exports.TO_LOWER_CASE = TO_LOWER_CASE;
module.exports.TRIM = TRIM;
module.exports.all = () => [TO_LOWER_CASE, TRIM];
