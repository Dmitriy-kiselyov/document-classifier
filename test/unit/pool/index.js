'use strict';

const Promise = require('bluebird');

const Pool = require('lib/pool');

describe('pool', () => {
    it('should return object id', async () => {
        const pool = new Pool(10);
        const obj = await pool.get({object: '123', size: 3});

        assert.equal(obj.object, '123');
        assert.isFinite(obj.id);
    });

    it('should throw if object size is biggen then pool limit', async () => {
        const pool = new Pool(9);
        const run = pool.get({object: 'obj', size: 10});

        await assert.isRejected(run, `Object's size should not exceed pool limit`);
    });

    it('should release object by id', async () => {
        const pool = new Pool(7);
        const obj = await pool.get({object: '123', size: 3});

        assert.equal(pool.left, 4);
        pool.release(obj.id);
        assert.equal(pool.left, 7);
    });

    it('should throw if no object in queue by given id', async () => {
        const pool = new Pool(7);
        const obj = await pool.get({object: '123', size: 3});
        const run = () => pool.release(obj.id + 1); //not given id

        await assert.throws(run, 'There is no object with such id waiting for release');
    });

    it('should not exceed pool limit', async () => {
        const firstReleased = sinon.stub().named('firstReleased');
        const secondReleased = sinon.stub().named('secondReleased');

        const pool = new Pool(6);
        pool.get({object: '12', size: 2})
            .then(async (obj) => {
                await Promise.delay(25);
                pool.release(obj.id);
                firstReleased();
            });
        pool.get({object: '123', size: 3})
            .then(async (obj) => {
                await Promise.delay(50);
                pool.release(obj.id);
                secondReleased();
            });

        await pool.get({object: '1234', size: 4})
            .then(() => {
                assert.calledOnce(firstReleased);
                assert.calledOnce(secondReleased);
            });
    });

    it('should return all object from queue', async () => {
        const firstReleased = sinon.stub().named('firstReleased');
        const secondReleased = sinon.stub().named('secondReleased');
        const thirdReleased = sinon.stub().named('thirdReleased');

        const pool = new Pool(6);
        const p1 = pool.get({object: '1234', size: 4})
            .then((obj) => {
                pool.release(obj.id);
                firstReleased();
            });
        const p2 = pool.get({object: '123', size: 3})
            .then((obj) => {
                pool.release(obj.id);
                secondReleased();
            });
        const p3 = pool.get({object: '12345', size: 5})
            .then((obj) => {
                pool.release(obj.id);
                thirdReleased();
            });
        await Promise.all([p1, p2, p3]);

        assert.calledOnce(firstReleased);
        assert.calledOnce(secondReleased);
        assert.calledOnce(thirdReleased);
        assert.callOrder(firstReleased, secondReleased, thirdReleased);
    });
});
