'use strict';

const Config = require('lib/config/index');
const Transformers = require('lib/reader-decorator/transformers');
const Filters = require('lib/reader-decorator/filters');

describe('config', () => {
    let defaultConfig;

    beforeEach(() => {
        defaultConfig = {
            log: true,
            countWords: false,
            poolSize: 524288000,
            withLearning: false,
            randomWeights: false,
            learningIterations: 1,
            learningRate: 0.1,
            dictionaryFilters: {
                count: 1,
                common: undefined
            },
            transformers: Transformers.default(),
            filters: Filters.default()
        };
    });

    describe('default', () => {
        it('should provide default config', () => {
            const config = Config.create({});

            assert.deepEqual(config, defaultConfig);
        });

        it('should rewrite default parametrs', () => {
            const config = Config.create({poolSize: 1234, randomWeights: true});

            defaultConfig.poolSize = 1234;
            defaultConfig.randomWeights = true;
            assert.deepEqual(config, defaultConfig);
        });

        it('should rewrite transformers and filters', () => {
            const filter = () => {};
            const config = Config.create({transformers: [], filters: [filter]});

            defaultConfig.transformers = [];
            defaultConfig.filters = [filter];
            assert.deepEqual(config, defaultConfig);
        });

        it('should rewrite dictionary filter parametrs', () => {
            const config = Config.create({
                dictionaryFilters: {
                    common: 20
                }
            });

            defaultConfig.dictionaryFilters.common = 20;
            assert.deepEqual(config, defaultConfig);
        });
    });

    describe('validation', () => {
        beforeEach(() => {
            delete defaultConfig.dictionaryFilters.common;
        });

        it('should assert boolean for "log"', () => {
            defaultConfig.log = 'hello';

            assert.throws(() => Config.create(defaultConfig), '"log" should be boolean but got string');
        });

        it('should assert boolean for "countWords"', () => {
            defaultConfig.countWords = 123;

            assert.throws(() => Config.create(defaultConfig), '"countWords" should be boolean but got number');
        });

        it('should assert positive integer for "poolSize"', () => {
            defaultConfig.poolSize = 0;

            assert.throws(() => Config.create(defaultConfig), '"poolSize" should be positive integer but got 0');
        });

        it('should assert boolean for "withLearning"', () => {
            defaultConfig.withLearning = undefined;

            assert.throws(() => Config.create(defaultConfig), '"withLearning" should be boolean but got undefined');
        });

        it('should assert boolean for "randomWeights"', () => {
            defaultConfig.randomWeights = null;

            assert.throws(() => Config.create(defaultConfig), '"randomWeights" should be boolean but got null');
        });

        it('should assert positive integer for "learningIterations"', () => {
            defaultConfig.learningIterations = [123];

            assert.throws(() => Config.create(defaultConfig), '"learningIterations" should be positive integer but got array');
        });

        describe('learningRate', () => {
            it('should assert number', () => {
                defaultConfig.learningRate = {a: 5};

                assert.throws(() => Config.create(defaultConfig), '"learningRate" should be number but got object');
            });

            it('should assert number in range (0 ; 1]', () => {
                defaultConfig.learningRate = 1.1;
                assert.throws(() => Config.create(defaultConfig), '"learningRate" should be in range (0 ; 1] but got 1.1');

                defaultConfig.learningRate = 0;
                assert.throws(() => Config.create(defaultConfig), '"learningRate" should be in range (0 ; 1] but got 0');
            });
        });

        describe('dictionaryFilters', () => {
            it('should assert object', () => {
                defaultConfig.dictionaryFilters = true;

                assert.throws(() => Config.create(defaultConfig), '"dictionaryFilters" should be object but got boolean');
            });

            it('should assert non-negative integer for "count"', () => {
                defaultConfig.dictionaryFilters = {count: -1};

                assert.throws(() => Config.create(defaultConfig), '"dictionaryFilters.count" should be non-negative integer but got -1');
            });

            it('should assert positive integer for "count"', () => {
                defaultConfig.dictionaryFilters = {common: false};

                assert.throws(() => Config.create(defaultConfig), '"dictionaryFilters.common" should be positive integer but got boolean');
            });
        });

        it('should assert array of functions for "transformers"', () => {
            defaultConfig.transformers = 'Hello';

            assert.throws(() => Config.create(defaultConfig), '"transformers" should be an array of functions but got string');
        });

        it('should assert array of functions for "filters"', () => {
            defaultConfig.filters = [() => {}, 123];

            assert.throws(() => Config.create(defaultConfig), '"filters" should be an array of functions but got number inside array');
        });

        describe('keys', () => {
            it('should assert config keys', () => {
                assert.throws(() => Config.create({a: 5}), 'Unknown option "a"');
            });

            it('should assert keys recursively', () => {
                defaultConfig.dictionaryFilters = {count: 1, foo: 'bar'};

                assert.throws(() => Config.create(defaultConfig), 'Unknown option "dictionaryFilters.foo"');
            });
        });

        it('should accept valid config', () => {
            const config = {
                log: true,
                countWords: true,
                poolSize: 1234,
                withLearning: true,
                randomWeights: false,
                learningIterations: 3,
                learningRate: 0.5,
                dictionaryFilters: {
                    count: 3,
                    common: 20
                },
                transformers: Transformers.default(),
                filters: [() => {}]
            };

            const resultConfig = Config.create(config);

            assert.deepEqual(resultConfig, config);
        });
    });
});
