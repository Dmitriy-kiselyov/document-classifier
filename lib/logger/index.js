'use strict';

const Config = require('../config');
const logger = require('./logger');
const silentLogger = require('./silent');

module.exports = () => {
    return Config.get().log ? logger : silentLogger;
};
