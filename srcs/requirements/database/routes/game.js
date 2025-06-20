// DATABASE CONTAINER

/*
import schema from '../schemas/userBodyJsonSchema.js'
import updateRecordsSchema from '../schemas/updateRecordsSchema.js'
import updateNameSchema from '../schemas/updateNameSchema.js'
*/

async function gameRoutes (fastify, options) {
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
		const { players, tournamentId } = request.body;
		if (!Array.isArray(players) || players.length < 2) {
			return reply.status(400).send({ error: "At least two player names are required." });
		}

		try {
			const insertGuest = `INSERT OR IGNORE INTO users (name, is_guest) VALUES (?, ?)`;
			const getUserId = `SELECT id FROM users WHERE name = ?`;
			const insertTourn = `INSERT INTO tournaments (user_id) VALUES (?)`;
			const joinTourntoUser = `INSERT INTO users_join_tournaments (user_id, tournament_id) VALUES (?, ?)`; 
			const is_guest = true;
			const userIds = [];

			for (const player of players) {
				 await new Promise ((resolve, reject) => {
					db.run(insertGuest, [player, is_guest], function (err) {
						if (err) return reject(err);
						resolve({player, is_guest});
					});
				})
				const userId = await new Promise((resolve, reject) => {
					db.get(getUserId, [player], (err, row) => {
						if (err) return reject(err);
						resolve(row.id);
					});
				});
				userIds.push(userId);
			}
			const ownerId = userIds[0];
			const tournamentId = await new Promise ((resolve, reject) => {
				db.run(insertTourn, [ownerId], function (err) {
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
}

export default gameRoutes
