// DATABASE CONTAINER

import schema from '../schemas/userBodyJsonSchema.js'
import updateRecordsSchema from '../schemas/updateRecordsSchema.js'
import updateNameSchema from '../schemas/updateNameSchema.js'
import generateBracket from '../utils/bracket.js'

async function routes (fastify, options) {
	fastify.get('/health', async (request, reply) => {
		return { hello: 'world' }
	})

	fastify.get('/api/users', async (request, reply) => {
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

	fastify.get('/api/users/:email', async (request, reply) => {
		const db = fastify.sqlite;
		const { email } = request.params;
  		try {
	    		const user = await new Promise((resolve, reject) => {
    				db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    	   		 		if (err) return reject(err);
    	    				resolve(row);
    	  			});
    			});
    			if (!user) {
    				return reply.status(404).send({ message: 'User not found' });
    			}
    			return reply.send(user);
  		} catch (err) {
    			fastify.log.error(err);
    			return reply.status(500).send({ error: 'database GET error', details: err.message });
  		}
	});

	fastify.get('/api/users/profil/:id', async (request, reply) => {
		const db = fastify.sqlite;
		const { id } = request.params;	
  		try {
	    		const user = await new Promise((resolve, reject) => {
    				db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    	   		 		if (err) return reject(err);
    	    				resolve(row);
    	  			});
    			});
    			if (!user) {
    				return reply.status(404).send({ message: 'User not found' });
    			}
    			return reply.send(user);
  		} catch (err) {
    			fastify.log.error(err);
    			return reply.status(500).send({ error: 'database GET error', details: err.message });
  		}
	});

	fastify.get('/users/history/:id', async (request, reply) => {
		const db = fastify.sqlite;
		const { id } = request.params;
	})

	fastify.patch('/api/users/wins/:id', async (request, reply) => {
		const db = fastify.sqlite;
		const { id } = request.params;
		try {
			const rows = await new Promise((resolve, reject) => {
			db.run('UPDATE users SET wins = wins + 1 WHERE id = ?', [id], function (err) {
				if (err) return reject(err);
				if (this.changes === 0) {
						return reject(new Error('User not found'));
				}
				resolve(id);
				});
			});
    		if (!rows) {
    			return reply.status(404).send({ message: 'User not found' });
    		}
			reply.send({ message: 'Wins updated successfully'});
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({ error: 'database UPDATE error', details: err.message });
		}
	});

	fastify.patch('/api/users/losses/:id', async (request, reply) => {
		const db = fastify.sqlite;
		const { id } = request.params;
		try {
			const rows = await new Promise((resolve, reject) => {
			db.run('UPDATE users SET losses = losses + 1 WHERE id = ?', [id], function (err) {
				if (err) return reject(err);
				if (this.changes === 0) {
					return reject(new Error('User not found'));
				}
				resolve(id);
				});
			});
    		if (!rows) {
    			return reply.status(404).send({ message: 'User not found' });
    		}
			reply.send({ message: 'Losses updated successfully'});
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({ error: 'database UPDATE error', details: err.message });
		}
	});

	fastify.patch('/api/users/:id', { schema: updateNameSchema }, async (request, reply) => {
		const db = fastify.sqlite;
		const { id } = request.params;
		const { name } = request.body;
		try {
			const rows = await new Promise((resolve, reject) => {
				db.run('UPDATE users SET name = ? WHERE id = ?', [name, id], function (err) {
					if (err) return reject(err);
					if (this.changes === 0) {
						return reject(new Error('User not found'));
					}
					resolve(id, name);
				});
			});
    		if (!rows) {
    			return reply.status(404).send({ message: 'User not found' });
    		}
			reply.send({ message: 'Name updated successfully', name });
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({ error: 'database UPDATE error', details: err.message });
		}
	});

	fastify.delete('/api/users/:id', async (request, reply) => {
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

	fastify.post('/api/users', async (request, reply) => {
		const { name, is_guest } = request.body;

		if (typeof name !== 'string' || !name.trim()) {
			return reply.code(400).send({ error: 'Invalid name' });
		}

		try {
			const result = await fastify.db.run(
				`INSERT INTO users (name, is_guest) VALUES (?, ?)`,
				[name.trim(), is_guest ? 1 : 0]
			);
			const userId = result.lastID;
			return { userId };
		} catch (err) {
			console.error('User creation error:', err);
			return reply.code(500).send({ error: 'User creation failed' });
		}
	});

	fastify.patch('/api/users/2fa-toggle', async (request, reply) => {
		const db = fastify.sqlite;
		const { enabled, id } = request.body;

		if (enabled === undefined) return reply.status(400).send({ error: 'Missing enabled flag' });
		try {
			await new Promise((resolve, reject) => {
				db.run(`UPDATE users SET twofa_enabled = ? WHERE id = ?`, [enabled ? 1 : 0, id],
				function(err) {
					if (err) return reject(err);
					if (this.changes === 0) return reject(new Error('User not found'));
					resolve();
				});
			});
			reply.send({ message: `2FA ${enabled ? 'enabled' : 'disabled'}`, enabled });
		} catch (err) {
			fastify.log.error(err);
			if (err.message === 'User not found') return reply.status(404).send({ error: 'User not found' });
			return reply.status(500).send({ error: 'Database update error', details: err.message });
		}
	});
}

export default routes
