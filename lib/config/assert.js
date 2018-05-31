'use strict';

const {type} = require('./utils');

module.exports.boolean = (key, value) => {
    assertType('boolean', key, value);
};

module.exports.object = (key, value) => {
    assertType('object', key, value);
};

module.exports.positive = (key, value) => {
    assertType('number', key, value, 'positive integer');
    if (!Number.isInteger(value) || value <= 0) {
        throw new Error(`"${key}" should be positive integer but got ${value}`);
    }
};

module.exports.nonNegative = (key, value) => {
    assertType('number', key, value, 'non-negative integer');
    if (!Number.isInteger(value) || value < 0) {
        throw new Error(`"${key}" should be non-negative integer but got ${value}`);
    }
};

module.exports.functions = (key, value) => {
    assertType('array', key, value, 'an array of functions');
    value.forEach((value) => {
        if (type(value) !== 'function') {
            throw new Error(`"${key}" should be an array of functions but got ${type(value)} inside array`);
        }
    });
};

module.exports.decimalRange = (key, value) => {
    assertType('number', key, value);
    if (!Number.isFinite(value) || value <= 0 || value > 1) {
        throw new Error(`"${key}" should be in range (0 ; 1] but got ${value}`);
    }
};

function assertType(expected, key, value, specificType = expected) {
    if (type(value) !== expected) {
        throw new Error(`"${key}" should be ${specificType} but got ${type(value)}`);
    }
}
