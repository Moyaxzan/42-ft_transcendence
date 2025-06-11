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


	const userIds = [1, 2, 3, 4, 5, 6];
	fastify.log.info(generateBracket(userIds));
	//fastify.log.info("prout");

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

	fastify.get('/api/matches/:match_round/:match_index', async (request, reply) => {
		const db = fastify.sqlite;
		const { match_round, match_index } = request.params;
		try {
			const rows = await new Promise((resolve, reject) => {
			const query = `SELECT users.* FROM matches JOIN users ON users.id = matches.user_id OR users.id = matches.opponent_id WHERE matches.match_round = ? AND matches.match_index = ?`
				db.all(query, [match_round, match_index], (err, rows) => {
					if (err) return reject(err);
					resolve(rows);
				});
			});
			if (!rows) {
				return reply.send('No match found');
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

	fastify.post('/api/users/google-signin', async (request, reply) => {
	const db = fastify.sqlite;
	const { email, name, google_user, ip_address } = request.body;

	try {
		const insertQuery = `INSERT INTO users (email, name, google_user, ip_address) VALUES (?, ?, ?, ?)`;
		await new Promise((resolve, reject) => {
			db.run(insertQuery, [email, name, google_user, ip_address ? 1 : 0], function (err) {
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

	fastify.post('/api/users/signin', { schema }, async (request, reply) => {
		const db = fastify.sqlite;
		const { is_ia, name, email, id_token, password_hash, reset_token, reset_expiry, ip_address, is_log, points } = request.body;
		try {
			const rows = await new Promise((resolve, reject) => {
			const query = `INSERT INTO users(is_ia, name, email, id_token, \
					password_hash, reset_token, reset_expiry, \
					ip_address, is_log, points)
					VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
			db.run(query, [is_ia, name, email, id_token, password_hash,
					reset_token, reset_expiry, ip_address, is_log,
				points], function (err) {
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
					resolve();
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
					resolve(id, name);
				});
			});
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


	fastify.post('/api/tournaments', async (request, reply) => {
		const db = fastify.sqlite;
		const { players } = request.body;

		if (!Array.isArray(players) || players.length < 2) {
			return reply.status(400).send({ error: "At least two player names are required." });
		}

		try {
			await new Promise((resolve, reject) => {
				db.serialize(() => {
					// Step 1: Insert a new tournament
					db.run(`INSERT INTO tournaments (user_id) VALUES (NULL)`,
						function (err) {
							if (err) return reject(err);
							const tournamentId = this.lastID;

							// Step 2: Insert users if they don't exist
							const insertUser = db.prepare(`INSERT OR IGNORE INTO users (name, ip_address) VALUES (?, '0.0.0.0')`);
							players.forEach(name => insertUser.run(name));
							insertUser.finalize(() => {
								// Step 3: Retrieve user IDs
								db.all(
									`SELECT id FROM users WHERE name IN (${players.map(() => '?').join(',')})`,
									players,
									(err, rows) => {
										if (err) return reject(err);

										// Step 4: Link users to the tournament
										const link = db.prepare(`INSERT INTO users_join_tournaments (user_id, tournament_id) VALUES (?, ?)`);
										rows.forEach(({ id }) => link.run(id, tournamentId));
										link.finalize(resolve);
									}
								);
							});
						}
					);
				});
			});

			reply.send({ message: "Tournament created with users." });
		} catch (err) {
			fastify.log.error(err);
			reply.status(500).send({ error: "Database error", details: err.message });
		}
	});
}

export default routes
