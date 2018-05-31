'use strict';

module.exports = require('./lib/classifier');
module.exports.Dataset = require('./lib/data-builder/dataset');
module.exports.TRANSFORMERS = require('./lib/reader-decorator/transformers');
module.exports.FILTERS = require('./lib/reader-decorator/filters');
