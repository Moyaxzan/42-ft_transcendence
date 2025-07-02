// DATABASE CONTAINER

import schema from '../schemas/userBodyJsonSchema.js'
import updatePointsSchema from '../schemas/updatePointsSchema.js'
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

	// fastify.get('/users/history/:id', async (request, reply) => {
	// 	const db = fastify.sqlite;
	// 	const { id } = request.params;
	// 	try {
	// 		const user = await new Promise((resolve, reject) => {
	// 		db.get('SELECT * FROM matches WHERE user_id = ?', [id], (err, row) => {
	// 			if (err) return reject(err);
	// 			resolve(row);
	// 			});
	// 		});
	// 		return reply.send(user);
	// 	} catch (err) {
	// 		fastigy.log.error(err);
	// 		return reply.status(500).send({ error: 'database GET error', details: err.message });
	// 	}
	// })

	fastify.patch('/api/users/points/:id', { schema: updatePointsSchema }, async (request, reply) => {
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
    			if (!rows) {
    				return reply.status(404).send({ message: 'User not found' });
    			}
			reply.send({ message: 'Point updated successfully', points });
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({ error: 'database UPDATE error', details: err.message });
		}
	});

	fastify.post('/api/users/history/:id', async (request, reply) => {
		const db = fastify.sqlite;
		const { id: user_id } = request.params;
		const { score, opponent_score, opponent_id } = request.body;

		const insertMatch = `
			INSERT INTO matches (user_id, opponent_id, score, opponent_score) VALUES (?, ?, ?, ?)
		`;
		const joinMatchToUser = `
			INSERT INTO users_join_matches (user_id, match_id) VALUES (?, ?)
		`;

		const isUserWinner = score > opponent_score;
		const winnerId = isUserWinner ? user_id : opponent_id;
		const loserId = isUserWinner ? opponent_id : user_id;

		const updateStatsIfExists = `
			UPDATE user_stats SET total_wins = total_wins + 1 WHERE user_id = ?
		`;
		const updateLoserStats = `
			UPDATE user_stats SET total_losses = total_losses + 1 WHERE user_id = ?
		`;

		// Crée une ligne dans user_stats si elle n'existe pas
		const insertIfMissing = `
			INSERT INTO user_stats (user_id, total_wins, total_losses, tournaments_played, tournaments_won)
			VALUES (?, 0, 0, 0, 0)
		`;

		try {
			// 1. Ajout du match
			const matchId = await new Promise((resolve, reject) => {
				db.run(insertMatch, [user_id, opponent_id, score, opponent_score], function (err) {
					if (err) return reject(err);
					resolve(this.lastID);
				});
			});

			// 2. Liaison au joueur (user_id est celui passé dans l’URL)
			await db.run(joinMatchToUser, [user_id, matchId]);

			// 3. S'assurer que les deux joueurs ont une entrée dans user_stats
			await db.run(insertIfMissing, [winnerId]).catch(() => {});
			await db.run(insertIfMissing, [loserId]).catch(() => {});

			// 4. Mise à jour des stats
			await db.run(updateStatsIfExists, [winnerId]);
			await db.run(updateLoserStats, [loserId]);

			reply.send({
				message: 'Match result and stats successfully updated',
				matchId,
				score,
				opponent_score
			});
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
}

export default routes
