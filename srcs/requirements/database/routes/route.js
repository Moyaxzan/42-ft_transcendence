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
			return reply.status(500).send({error: 'database GET error'});
		}
	});

	fastify.post('/users', async (request, reply) => {
		const db = fastify.sqlite;
		const { name } = request.body;
		try {
			const rows = await new Promise((resolve, reject) => {
			db.run('insert into users(name) values(?)', [name], function (err) {
				if (err) return reject(err);
				resolve({ id: this.lastID, name});
				});
			});
			reply.send({ message: 'User inserted successfully', name });
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({error: 'database POST error'});
		}
	});
}

export default routes
