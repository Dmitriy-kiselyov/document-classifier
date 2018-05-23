'use strict';

const Mask = require('./mask');

module.exports = class MaskWithCount extends Mask {
    _update(order) {
        this._mask[order]++;
    }
};
