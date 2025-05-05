async function routes (fastify, options) {
	fastify.get('/', async (request, reply) => {
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
			const result = rows.map(user =>`User id: ${user.id}\nUser name: ${user.name}`).join('\n');
			return reply.send(rows);
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({error: 'database error'});
		}
	});
}

export default routes
