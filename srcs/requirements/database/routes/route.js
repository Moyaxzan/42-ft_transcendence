async function routes (fastify, options) {
	fastify.get('/health', async (request, reply) => {
		return { hello: 'world' }
	})
	fastify.get('/users', async (request, reply) => {
		const db = fastify.sqlite;
		try {
			const rows = await new Promise((resolve, reject) => {
			db.all('select * from users', (err, rows) => {
				if (err) return reject(err);
				resolve(rows);
				});
			});
			if (!rows) {
				return reply.send('No user found');
			}
			return reply.send(rows);
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({error: 'database error'});
		}
	});

	const userBodyJsonSchema = {
		type: 'object',
		required: ['name'],
		properties: {
		name: { type: 'string' },
		},
	}

  const schema = {
    body: userBodyJsonSchema,
  }
	fastify.post('/users', { schema }, async (request, reply) => {
		const { name } = request.body;
		const db = fastify.sqlite;
		try {
		await new Promise((resolve, reject) => {
			db.run('INSERT INTO users (name) VALUES (?)', [name], function (err) {
			if (err) {
				console.error('SQLite insert error:', err);
				return reject(err);}
			resolve(); // Or resolve({ id: this.lastID }) if you want to return the new ID
			});
		});

		reply.send({ success: true });
		} catch (err) {
			fastify.log.error(err);
			reply.status(500).send({ error: 'Insert failed', details: err.message });
		// reply.status(500).send({ error: 'Insert failed' });
		}
  });
}

export default routes
