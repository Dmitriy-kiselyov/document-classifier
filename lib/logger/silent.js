'use strict';

const createStub = (...names) => {
    const stub = {};
    const noop = () => {};

    names.forEach((name) => stub[name] = noop);

    return stub;
};

module.exports = createStub('dictionary', 'neuronIteration', 'neuronReady', 'neuronsReady');
