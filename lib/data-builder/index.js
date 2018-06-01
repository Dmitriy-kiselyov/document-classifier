'use strict';

const Config = require('../config');

module.exports.get = () => {
    const prefix = Config.get().withLearning ? 'with' : 'without';
    return require(`./${prefix}-learning`);
};
