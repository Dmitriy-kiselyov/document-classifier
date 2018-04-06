'use strict';

const Promise = require('bluebird');

module.exports = class Pool {
    constructor(limit) {
        this._limit = limit;
        this._current = 0;

        this._waitForRelease = new Map();
        this._queue = []; //TODO: make it real queue
        this._idCount = 1;
    }

    async get(objectParams) {
        const {size} = objectParams;
        this._assertSize(size);

        if (this.left >= size) {
            return this._add(objectParams);
        } else {
            return new Promise((resolve) => {
                this._queue.push({
                    objectParams,
                    callback: () => resolve(this._add(objectParams))
                });
            });
        }
    }

    _add(objectParams) {
        const {object, size} = objectParams;
        const id = this._idCount++;
        this._waitForRelease.set(id, objectParams);
        this._current += size;

        return {object, id};
    }

    release(id) {
        this._assertId(id);
        const {size} = this._waitForRelease.get(id);
        this._current -= size;
        this._waitForRelease.delete(id);

        this._tryNextFromQueue();
    }

    _tryNextFromQueue() {
        if (this._queue.length === 0) {
            return;
        }

        const {objectParams: {size}, callback} = this._queue[0];
        if (this.left >= size) {
            this._queue.shift();
            callback();
        }
    }

    _assertSize(size) {
        if (size > this._limit) {
            throw new Error(`Object's size should not exceed pool limit`);
        }
    }

    _assertId(id) {
        if (!this._waitForRelease.has(id)) {
            throw new Error('There is no object with such id waiting for release');
        }
    }

    get limit() {
        return this._limit;
    }

    get left() {
        return this._limit - this._current;
    }
};
