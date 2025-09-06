// DATABASE CONTAINER

import schema from '../schemas/userBodyJsonSchema.js'

async function authRoutes (fastify, options) {
	fastify.post('/api/users/google-signin', async (request, reply) => {
		const db = fastify.sqlite;
		const { email, name, google_user } = request.body;

		try {
			const insertQuery = `INSERT INTO users (email, name, google_user) VALUES (?, ?, ?)`;
			await new Promise((resolve, reject) => {
				db.run(insertQuery, [email, name, google_user], function (err) {
					if (err) return reject(err);
					resolve();
				});
			});
			const user = await new Promise((resolve, reject) => {
				db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
					if (err) return reject(err);
					resolve(row);
				});
			});

			if (!user) {
				return reply.code(500).send({ error: 'User creation failed' });
			}

			return reply.send(user);

		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: 'Database error', details: err.message });
		}
	});

	fastify.post('/api/users/register', async (request, reply) => {
		fastify.log.info(request.body, "REGISTER BODY");
		const db = fastify.sqlite;
		const { email, name, password_hash } = request.body;
		
		if (!email || !name || !password_hash) {
        	return reply.code(400).send({ error: 'ValidationError', message: 'email, name and password_hash required' });
    	}

		try {
			const insertQuery = `INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)`;
			await new Promise((resolve, reject) => {
				db.run(insertQuery, [email, name, password_hash], function (err) {
					if (err) return reject(err);
					resolve();
				});
			});

			const user = await new Promise((resolve, reject) => {
				db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
					if (err) return reject(err);
					resolve(row);
				});
			});

			if (!user) {
				return reply.code(500).send({ error: 'User creation failed' });
			}

			return reply.send(user);

		} catch (err) {
			fastify.log.error(err);
			if (err && err.message && err.message.includes('UNIQUE')) {
            	let conflictField = 'unknown';
        		if (err.message.includes('users.email')) conflictField = 'email';
            	else if (err.message.includes('users.name')) conflictField = 'name';
            	return reply.code(409).send({ error: 'UniqueConstraint', field: conflictField, message: `${conflictField} already in use` });
        	}
        	return reply.code(500).send({ error: 'DatabaseError', details: err.message });
		}
	});

	fastify.post('/api/users/signin', { schema }, async (request, reply) => {
		const db = fastify.sqlite;
		const { is_guest, name, email, id_token, password_hash, reset_token, reset_expiry } = request.body;
		try {
			const rows = await new Promise((resolve, reject) => {
			const query = `INSERT INTO users(is_guest, name, email, id_token, \
					password_hash, reset_token, reset_expiry)
					VALUES(?, ?, ?, ?, ?, ?, ?)`;
			db.run(query, [is_guest, name, email, id_token, password_hash,
					reset_token, reset_expiry], function (err) {
					if (err) return reject(err);
					resolve({is_guest, name, email, id_token, password_hash, reset_token, reset_expiry});
				});
			});
			reply.send({ message: 'User inserted successfully', name });
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({ error: 'database POST error', details: err.message });
		}
	});

	fastify.patch('/api/users/:id/2fa-secret', async (request, reply) =>
	{
		const db = fastify.sqlite;
		const { id } = request.params;
		const { secret } = request.body;
	
		if (!secret) {
			return reply.status(400).send({ error: 'Missing 2FA secret' });
		}
	
		try {
			await new Promise((resolve, reject) =>
			{
				db.run('UPDATE users SET twofa_secret = ? WHERE id = ?', [secret, id], function (err)
				{
					if (err) return reject(err);
					if (this.changes === 0)
						return reject(new Error('User not found'));
					resolve();
				});
			});
			return reply.send({ message: '2FA secret updated successfully' });
		}
		catch (err)
		{
			fastify.log.error(err);
			if (err.message === 'User not found')
				return reply.status(404).send({ error: 'User not found' });
			return reply.status(500).send({ error: 'Database update error', details: err.message });
		}
	});
}

export default authRoutes
