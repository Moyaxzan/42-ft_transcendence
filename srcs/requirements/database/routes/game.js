// DATABASE CONTAINER

import schema from '../schemas/userBodyJsonSchema.js'
import updatePointsSchema from '../schemas/updatePointsSchema.js'
import updateNameSchema from '../schemas/updateNameSchema.js'
//import generateBracket from '../utils/bracket.js'

async function gameRoutes (fastify, options) {
	//fastify.get('/api/matches/:match_round/:match_index', async (request, reply) => {
	fastify.get('/api/play/:match_round/:match_index', async (request, reply) => {
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

	fastify.get('/api/play', async (request, reply) => {
		const db = fastify.sqlite;
		try {
			const rows = await new Promise((resolve, reject) => {
				db.all('SELECT * FROM matches', (err, rows) => {
					if (err) return reject(err);
					resolve(rows);
				});
			});
			if (!rows) {
				return reply.send('No matches found');
			}
			reply.send(rows);
		} catch (err) {
			fastify.log.error(err);
			return reply.send(500).send({error: 'database GET error', details: err.message});
		}
	});

	fastify.get('/api/tournaments', async (request, reply) => {
		const db = fastify.sqlite;
		try {
			const rows = await new Promise((resolve, reject) => {
				db.all('SELECT * FROM tournaments', (err, rows) => {
					if (err) return reject(err);
					resolve(rows);
				});
			});
			if (!rows) {
				return reply.send('No tournaments found');
			}
			reply.send(rows);
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({error: 'database GET error', details: err.message});
		}
	});

	fastify.post('/api/tournaments', async (request, reply) => {
		const db = fastify.sqlite;
		db.run(`PRAGMA foreign_keys = ON`);
		const { players, tournamentId } = request.body;
		console.log("📦 Contenu complet du body :", request.body);
		if (!Array.isArray(players) || players.length < 2) {
			return reply.status(400).send({ error: "COUCOU" });
		}

		try {
			const insertGuest = `INSERT OR IGNORE INTO users (name, is_guest) VALUES (?, ?)`;
			const getUserId = `SELECT id FROM users WHERE name = ?`;
			const insertTourn = `INSERT INTO tournaments (user_id, match_id) VALUES (?, ?)`;
			const joinTourntoUser = `INSERT INTO users_join_tournaments (user_id, tournament_id) VALUES (?, ?)`; 
			const is_guest = true;
			const userIds = [];

			for (const name of players) {
				 await new Promise ((resolve, reject) => {
					db.run(insertGuest, [name, is_guest], function (err) {
						if (err) return reject(err);
						resolve({name, is_guest});
					});
				})
				const 	userId = await new Promise((resolve, reject) => {
					db.get(getUserId, [name], (err, row) => {
						if (err) return reject(err);
						resolve(row.id);
					});
				});
				userIds.push(userId);
			}
			const ownerId = userIds[0];
			const tournamentId = await new Promise ((resolve, reject) => {
				db.run(insertTourn, [ownerId, null], function (err) {
					if (err) return reject(err);
					resolve(this.lastID);
				});
			});
			for (const uid of userIds) {
				await new Promise ((resolve, reject) => {
					db.run(joinTourntoUser, [uid, tournamentId], function (err) {
						if (err) return reject(err);
						resolve();
					});
				});
			}
			reply.send({message: 'Guests successfully added', players, tournamentId});
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({error: 'database POST error', details: err.message});
		}
	});

/*
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
*/
}

export default gameRoutes
