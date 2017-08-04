'use strict';

const util = require('util');
const delay = util.promisify(setTimeout);
const { ActionPool } = require('../..');
const { expect } = require('chai');

describe('ActionPool', function actionPoolTests() {

	this.timeout(30000);
	this.slow(20000);

	describe('enqueue', () => {

		it('works', async () => {

			const pool = new ActionPool({ limit: 2 });
			const r = [];

			pool.enqueue(() => delay(200).then(() => r.push(1)));
			pool.enqueue(() => delay(100).then(() => r.push(2)));
			pool.enqueue(() => delay(50).then(() => r.push(3)));

			await delay(210);

			expect(r).to.eql([2, 3, 1]);
		});

		it('handles a lot of promises', async () => {

			const pool = new ActionPool({ limit: 100 });
			let lastPromise;

			for (let i = 0; i < 100000; i++)
				lastPromise = pool.enqueue(() => Promise.resolve());

			await lastPromise;
		});
	});
});
