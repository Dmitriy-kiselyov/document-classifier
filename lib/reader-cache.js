'use strict';

const Config = require('./config');
const ReaderFactory = require('./reader-factory/index');
const ReaderDecorator = require('./reader-decorator/index');

let cache = new Map();

function findOrCreateReader(file) {
    if (cache.has(file)) {
        return cache.get(file);
    }

    const reader = createReader(file);
    cache.set(file, reader);
    return reader;
}

function createReader(file) {
    const reader = ReaderFactory.create(file);
    return decorateReader(reader);
}

function decorateReader(reader) {
    const config = Config.get();

    const decorator = ReaderDecorator.create(reader);
    decorator.addTransformers(config.transformers);
    decorator.addFilters(config.filters);

    return decorator;
}

function clean() {
    cache = new Map();
}

module.exports.get = findOrCreateReader;
module.exports.clean = clean;
