'use strict';

const utils = require('./utils');

module.exports = class Neuron {
    static create(mask) {
        return new Neuron(mask);
    }

    static createRandom(length) {
        const mask = new Array(length);
        for (let i = 0; i < length; i++) {
            mask[i] = Math.random();
        }

        return new Neuron(mask);
    }

    static createEqual(length) {
        const mask = new Array(length).fill(1);
        return new Neuron(mask);
    }

    constructor(mask) {
        this._w = this._normalize(mask);
    }

    _normalize(mask) {
        let w;
        if (mask === undefined) {
            mask = this._w;
            w = this._w;
        } else {
            w = new Array(mask.length).fill(0);
        }

        const length = this._length(mask);
        if (length !== 0) {
            for (let i = 0; i < w.length; i++) {
                w[i] = mask[i] / length;
            }
        }

        return w;
    }

    _length(mask) {
        const length = mask.reduce((prev, v) => prev + v * v, 0);
        return Math.sqrt(length);
    }

    recognize(mask) {
        this._validateMask(mask);

        mask = this._normalize(mask);
        let ans = 0;
        for (let i = 0; i < mask.length; i++) {
            ans += this._w[i] * mask[i]; //сумматор
        }
        return utils.round(ans);
    }

    teach(mask, learningRate) {
        this._validateMask(mask);

        mask = this._normalize(mask);
        for (let i = 0; i < mask.length; i++) {
            this._w[i] += mask[i] * learningRate;
        }
        this._normalize();
    }

    _validateMask(mask) {
        if (mask.length !== this._w.length) {
            throw new Error('Mask length should be equal to weights length');
        }
    }
};
