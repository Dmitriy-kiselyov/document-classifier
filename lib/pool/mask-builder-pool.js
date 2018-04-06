'use strict';

const MaskBuilder = require('../mask-builder');
const Pool = require('../pool');

module.exports = class MaskBuilderPool {
    constructor(limit) {
        this._pool = new Pool(limit);
    }

    async get(dictionary) {
        const {id} = await this._pool.get({
            object: dictionary,
            size: this._size(dictionary)
        });

        const maskBuilder = MaskBuilder.create(dictionary);
        return {id, maskBuilder};
    }

    release(id) {
        this._pool.release(id);
    }

    _size(dictionary) {
        return dictionary.size;
    }
};
