'use strict';

const Neuron = require('lib/neuron');

describe('neuron', () => {
    it('should not modify mask', () => {
        const mask = [1, 0, 1];
        new Neuron(mask); // eslint-disable-line no-new

        assert.deepEqual(mask, [1, 0, 1]);
    });

    describe('recognize', () => {
        it('should throw if masks have different length', () => {
            const neuron = new Neuron([1, 0, 1]);

            assert.throws(() => neuron.recognize([1, 0]));
        });

        it('should recognize file as 1 if mask are equal', () => {
            const mask = [1, 0, 1];
            const neuron = new Neuron(mask);

            assert.equal(neuron.recognize(mask), 1);
        });

        it('should not recognize file at all if mask is empty', () => {
            const neuron = new Neuron([1, 0, 1]);

            assert.equal(neuron.recognize([0, 0, 0]), 0);
        });

        it('should recognize mask at 0.5 if half values are equal', () => {
            const neuron = new Neuron([1, 0, 1, 0]);

            assert.equal(neuron.recognize([1, 0, 0, 1]), 0.5);
        });

        it('should recognize closest mask better', () => {
            const neuron = new Neuron([1, 0, 1, 0]);

            assert.isTrue(neuron.recognize([1, 0, 1, 1]) > neuron.recognize([1, 0, 0, 1]));
        });
    });

    describe('teach', () => {
        it('should throw if masks have different length', () => {
            const neuron = new Neuron([1, 0, 1]);

            assert.throws(() => neuron.teach([1, 0]));
        });

        it('should teach neuron', () => {
            const neuron = new Neuron([1, 0, 1, 0]);

            const before = neuron.recognize([1, 0, 0, 1]);
            neuron.teach([1, 0, 0, 1], 0.5);

            assert.isTrue(neuron.recognize([1, 0, 0, 1]) > before);
            assert.notEqual(neuron.recognize([1, 0, 1, 0]), 1);
        });

        it('should teach faster if learningRate is higher', () => {
            const neuron1 = new Neuron([1, 0, 1, 0]);
            const neuron2 = new Neuron([1, 0, 1, 0]);

            neuron1.teach([1, 0, 0, 1], 0.3);
            neuron2.teach([1, 0, 0, 1], 0.8);

            assert.isTrue(neuron1.recognize([1, 0, 0, 1]) < neuron2.recognize([1, 0, 0, 1]));
        });
    });
});
