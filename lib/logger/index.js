'use strict';

const Config = require('../config');
const logger = require('./logger');
const silentLogger = require('./silent');

module.exports.get = () => {
    return Config.get().log ? logger : silentLogger;
};
