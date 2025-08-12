// DATABASE CONTAINER

import schema from '../schemas/userBodyJsonSchema.js'
import updateRecordsSchema from '../schemas/updateRecordsSchema.js'
import updateNameSchema from '../schemas/updateNameSchema.js'
import generateBracket from '../utils/bracket.js'

async function routes (fastify, options) {
	fastify.get('/health', async (request, reply) => {
		return { hello: 'world' }
	})

/*
	fastify.addHook('onRequest', (request, reply, done) => {
		// authentication code
	});
*/

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

	//fastify.patch('/api/users/points/:id', { schema: updatePointsSchema }, async (request, reply) => {
	fastify.patch('/api/users/wins/:id', { schema: updateRecordsSchema }, async (request, reply) => {
		const db = fastify.sqlite;
		const { id } = request.params;
		let { wins, losses } = request.body;
		wins += 1;
		try {
			const rows = await new Promise((resolve, reject) => {
			db.run('UPDATE users SET wins = ? WHERE id = ?', [wins, id], function (err) {
				if (err) return reject(err);
				if (this.changes === 0) {
						return reject(new Error('User not found'));
				}
				resolve(id, wins);
				});
			});
    		if (!rows) {
    			return reply.status(404).send({ message: 'User not found' });
    		}
			reply.send({ message: 'Wins updated successfully', wins });
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({ error: 'database UPDATE error', details: err.message });
		}
	});

	fastify.patch('/api/users/losses/:id', { schema: updateRecordsSchema }, async (request, reply) => {
		const db = fastify.sqlite;
		const { id } = request.params;
		let { wins, losses } = request.body;
		losses += 1;
		try {
			const rows = await new Promise((resolve, reject) => {
			db.run('UPDATE users SET losses = ? WHERE id = ?', [losses, id], function (err) {
				if (err) return reject(err);
				if (this.changes === 0) {
					return reject(new Error('User not found'));
				}
				resolve(id, losses);
				});
			});
    		if (!rows) {
    			return reply.status(404).send({ message: 'User not found' });
    		}
			reply.send({ message: 'Losses updated successfully', losses });
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({ error: 'database UPDATE error', details: err.message });
		}
	});

	fastify.post('/api/users/history/:id', async (request, reply) => {
		const db = fastify.sqlite;
		const { id: user_id } = request.params;
		const { isWinner } = request.body;

		try {
			// vérifie si une entrée existe déjà pour cet utilisateur
			const row = await db.get(
				'SELECT * FROM user_stats WHERE user_id = ?',
				[user_id]
			);

			if (row) {
				// mise à jour des stats existantes
				if (isWinner) {
					await db.run(
						'UPDATE user_stats SET total_wins = total_wins + 1 WHERE user_id = ?',
						[user_id]
					);
				} else {
					await db.run(
						'UPDATE user_stats SET total_losses = total_losses + 1 WHERE user_id = ?',
						[user_id]
					);
				}
			} else {
				//creation de la ligne si elle n'existe pas
				await db.run(
					'INSERT INTO user_stats (user_id, total_wins, total_losses) VALUES (?, ?, ?)',
					[user_id, isWinner ? 1 : 0, isWinner ? 0 : 1]
				);
			}

			reply.send({ success: true });
		} catch (err) {
			console.error('Erreur lors de la mise à jour des stats :', err);
			reply.status(500).send({ error: 'Erreur serveur' });
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
}

export default routes
