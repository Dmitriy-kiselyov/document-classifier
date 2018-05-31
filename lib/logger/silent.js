'use strict';

const createStub = (...names) => {
    const stub = {};
    const noop = () => {};

    names.forEach((name) => stub[name] = noop);

    return names;
};

module.exports = createStub('dictionary', 'neuronReady', 'neuronsReady');
