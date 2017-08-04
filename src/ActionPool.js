'use strict';

const _limit = Symbol('limit');
const _queue = Symbol('queue');
const _running = Symbol('running');

/**
 * Create a promise, which will run passed function only when run() method is invoked
 *
 * @param {function(): Promise<any>} action
 * @returns {Promise<any>}
 */
function makeDelayedPromise(action) {
	if (typeof action !== 'function') throw new TypeError('action argument must be a Function');

	let resolve;
	let reject;
	const promise = new Promise((rs, rj) => {
		resolve = rs;
		reject = rj;
	});

	Object.defineProperty(promise, 'run', {
		value: () => action().then(resolve, reject)
	});

	return promise;
}


module.exports = class ActionPool {

	/**
	 * @type {number}
	 * @readonly
	 */
	get queued() {
		return this[_queue].length;
	}

	/**
	 * @type {number}
	 * @readonly
	 */
	get running() {
		return this[_running].size;
	}

	/**
	 * @type {number}
	 * @readonly
	 */
	get limit() {
		return this[_limit];
	}

	/**
	 * Creates an instance of ActionPool
	 *
	 * @param {{ limit: number }} [options]
	 */
	constructor({ limit } = {}) {
		if (typeof limit !== 'number' || limit <= 0)
			throw new TypeError('limit argument must be a positive finite number');

		this[_queue] = [];
		this[_running] = new Set();
		this[_limit] = limit;
	}

	/**
	 * Adds actions to a parallel execution queue, with a limited number of concurrent actions
	 *
	 * @param {function(): Promise<any>} action
	 * @returns {Promise<any>}
	 */
	enqueue(action) {
		if (typeof action !== 'function') throw new TypeError('action argument must be a Function');

		const promise = makeDelayedPromise(action);

		this[_queue].push(promise);

		this._check();

		return promise;
	}

	/**
	 * Check the pool and start an action, if possible
	 * @private
	 */
	_check() {
		if (this.queued && this.running < this.limit) {
			const promise = this[_queue].shift();

			this[_running].add(promise);

			promise.run().then(() => this._remove(promise));
		}
	}

	/**
	 * Remove complete action from the pool
	 * @private
	 * @param {Promise<any>} promise
	 */
	_remove(promise) {
		this[_running].delete(promise);
		this._check();
	}
};
