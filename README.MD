ActionPool
==========

Creates a promise for each enqueued task, but limits concurrent task executions. 


## Usage

```js
const util = require('util');
const delay = util.promisify(setTimeout);
const { ActionPool } = require('@banqu/action-pool');

(async function main() {

	const pool = new ActionPool({ limit: 100 });

	let lastPromise;
	for (let i = 0; i < 1000; i++) 
		lastPromise = pool.enqueue(() => delay(100));

	await lastPromise;

}());
```
