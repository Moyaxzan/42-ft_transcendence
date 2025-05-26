// DATABASE CONTAINER

import schema from '../schemas/userBodyJsonSchema.js'
import updatePointsSchema from '../schemas/updatePointsSchema.js'
import updateNameSchema from '../schemas/updateNameSchema.js'

async function routes (fastify, options) {
	fastify.get('/health', async (request, reply) => {
		return { hello: 'world' }
	})

/*
	fastify.addHook('onRequest', (request, reply, done) => {
		// authentication code
	});
*/

	fastify.get('/users', async (request, reply) => {
		const db = fastify.sqlite;
		try {
			const rows = await new Promise((resolve, reject) => {
			db.all('SELECT * FROM users', (err, rows) => {
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
			return reply.status(500).send({ error: 'database GET error', details: err.message });
		}
	});

	fastify.post('/users/login', { schema }, async (request, reply) => {
		const db = fastify.sqlite;
		const { is_ia, name, email, id_token, password_hash, reset_token, reset_expiry, ip_address, is_log, points } = request.body;
		try {
			const rows = await new Promise((resolve, reject) => {
			const query = `INSERT INTO users(is_ia, name, email, id_token, password_hash, reset_token, reset_expiry, ip_address, is_log, points)
					VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
			db.run(query, [is_ia, name, email, id_token, password_hash, reset_token, reset_expiry, ip_address, is_log, points], function (err) {
				if (err) return reject(err);
				resolve({is_ia, name, email, id_token, password_hash, reset_token, reset_expiry, ip_address, is_log, points});
				});
			});
			reply.send({ message: 'User inserted successfully', name });
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({ error: 'database POST error', details: err.message });
		}
	});


	fastify.patch('/users/points/:id', { schema: updatePointsSchema }, async (request, reply) => {
		const db = fastify.sqlite;
		const { id } = request.params;
		const { points } = request.body;
		try {
			const rows = await new Promise((resolve, reject) => {
			db.run('UPDATE users SET points = ? WHERE id = ?', [points, id], function (err) {
				if (err) return reject(err);
				resolve(id, points);
				});
			});
			reply.send({ message: 'Point updated successfully', points });
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({ error: 'database UPDATE error', details: err.message });
		}
	});

	fastify.patch('/users/:id', { schema: updateNameSchema }, async (request, reply) => {
		const db = fastify.sqlite;
		const { id } = request.params;
		const { name } = request.body;
		try {
			const rows = await new Promise((resolve, reject) => {
				db.run('UPDATE users SET name = ? WHERE id = ?', [name, id], function (err) {
					if (err) return reject(err);
					resolve(id, name);
				});
			});
			reply.send({ message: 'Name updated successfully', name });
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({ error: 'database UPDATE error', details: err.message });
		}
	});

	fastify.delete('/users/:id', async (request, reply) => {
		const db = fastify.sqlite;
		const { id } = request.params;
		try {
			const rows = await new Promise((resolve, reject) => {
			db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
				if (err) return reject(err);
				resolve(id);
				});
			});
			reply.send({ message: 'User deleted successfully', id });
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({ error: 'database DELETE error', details: err.message });
		}
	});
}

export default routes
