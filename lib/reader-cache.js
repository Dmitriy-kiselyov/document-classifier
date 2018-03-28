'use strict';

const ReaderFactory = require('./reader-factory/index');
const ReaderDecorator = require('./reader-decorator/index');
const transformers = require('./reader-decorator/transformers');
const filters = require('./reader-decorator/filters');

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
    const decorator = ReaderDecorator.create(reader);
    decorator.addTransformers(...transformers.all());
    decorator.addFilters(...filters.all());

    return decorator;
}

function clean() {
    cache = new Map();
}

module.exports.get = findOrCreateReader;
module.exports.clean = clean;
