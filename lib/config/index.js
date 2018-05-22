'use strict';

const Transformers = require('../reader-decorator/transformers');
const Filters = require('../reader-decorator/filters');
const assert = require('./assert');
const {type} = require('./utils');

const defaultConfig = {
    countWords: false,
    poolSize: 524288000,
    withLearning: false,
    randomWeights: false,
    learningIterations: 1,
    learningRate: 0.1,
    dictionaryFilters: {
        count: 1,
        common: undefined
    },
    transformers: Transformers.default(),
    filters: Filters.default()
};

const configTypes = {
    countWords: assert.boolean,
    poolSize: assert.positive,
    withLearning: assert.boolean,
    randomWeights: assert.boolean,
    learningIterations: assert.positive,
    learningRate: assert.decimalRange,
    dictionaryFilters: {
        count: assert.positive,
        common: assert.positive
    },
    transformers: assert.functions,
    filters: assert.functions
};

module.exports = (config) => {
    return construct(config);
};

function construct(config, defaults = defaultConfig, types = configTypes, base = '') {
    const result = {};

    assertKeys(config, Object.keys(defaults), base);

    Object.keys(defaults).forEach((key) => {
        const keyName = `${base}${key}`;

        if (!config.hasOwnProperty(key)) {
            result[key] = defaults[key];
        } else if (type(types[key]) === 'object') {
            assert.object(keyName, config[key]);
            result[key] = construct(config[key], defaults[key], types[key], `${base}${key}.`);
        } else {
            const value = config[key];
            types[key](keyName, value);
            result[key] = value;
        }
    });

    return result;
}

function assertKeys(config, keys, base = '') {
    Object.keys(config).forEach((key) => {
        if (!keys.includes(key)) {
            throw new Error(`Unknown option "${base}${key}"`);
        }
    });
}
