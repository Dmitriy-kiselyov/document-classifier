'use strict';

const utils = require('lib/neuron/utils');

describe('neuron/utils', () => {
    describe('round', () => {
        [
            {before: 5.123123, result: 5.12312},
            {before: 5.123126, result: 5.12313},
            {before: 5.123, result: 5.123},
            {before: 5.99999, result: 5.99999},
            {before: 5.9999999, result: 6}
        ].forEach(({before, result}) => {
            it(`should scale ${before} to ${result} by default`, () => {
                assert.equal(utils.round(before), result);
            });
        });

        it('should scale to integer if scale argument is 0', () => {
            assert.equal(utils.round(5.4, 0), 5);
            assert.equal(utils.round(5.5, 0), 6);
        });
    });
});
