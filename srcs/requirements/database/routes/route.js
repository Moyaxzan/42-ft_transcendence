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


	fastify.log.info("☺️ ☺️ ☺️");
	const userIds = [145, 12, 33, 78798789798, 55, 56];
	fastify.log.info(generateBracket(userIds));
	fastify.log.info("☺️ ☺️ ☺️");


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
		const { id } = request.params;
		const { user_id, score, opponent_score, opponent_id } = request.body;
		const insertMatch = `INSERT INTO matches (user_id, opponent_id, score, opponent_score) VALUES (?, ?, ?, ?)`;
		const joinMatchToUser = `INSERT INTO users_join_matches (user_id, match_id) VALUES (?, ?)`;
		try {
			const matchId = await new Promise((resolve, reject) => {
				db.run(insertMatch, [user_id, opponent_id, score, opponent_score],
				function (err) {
					if (err) return reject(err);
					resolve(this.lastID);
				});
			});
			await new Promise((resolve, reject) => {
				db.run(joinMatchToUser, [user_id, matchId], function (err) {
					if (err) return reject(err);
					resolve(user_id, matchId);
					});
			});
			reply.send({message: 'Match result succesfully added', matchId, score, opponent_score});
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
}

export default routes
