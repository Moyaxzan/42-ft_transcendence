// DATABASE CONTAINER

import schema from '../schemas/userBodyJsonSchema.js'
import updateRecordsSchema from '../schemas/updateRecordsSchema.js'
import updateNameSchema from '../schemas/updateNameSchema.js'
import generateBracket from '../utils/bracket.js'

async function gameRoutes (fastify, options) {
	fastify.get('/api/play/:tournament_id/:match_round/:match_index', async (request, reply) => {
		const db = fastify.sqlite;
		const { tournament_id, match_round, match_index } = request.params;

		try {
			const match = await new Promise((resolve, reject) => {
				db.get(
					`SELECT * FROM matches
					 WHERE tournament_id = ? AND match_round = ? AND match_index = ?`,
					[tournament_id, match_round, match_index],
					(err, row) => {
						if (err) return reject(err);
						resolve(row);
					}
				);
			});

			if (!match) {
				return reply.code(404).send({ error: 'Match not found' });
			}
			const players = await new Promise((resolve, reject) => {
				db.all(
					`SELECT * FROM users WHERE id IN (?, ?)`,
					[match.user_id, match.opponent_id],
					(err, rows) => {
						if (err) return reject(err);
						resolve(rows);
					}
				);
			});
			return reply.send({ match: match, players: players });
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({ error: 'Database error', details: err.message });
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

			if (!rows || rows.length === 0) {
				return reply.code(404).send({ error: 'No matches found' });
			}

			return reply.send(rows);
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({ error: 'Database GET error', details: err.message });
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

			if (!rows || rows.length === 0) {
				return reply.code(404).send({ error: 'No tournaments found' });
			}

			return reply.send(rows);
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({ error: 'Database GET error', details: err.message });
		}
	});

	fastify.post('/api/tournaments', async (request, reply) => {
		const db = fastify.sqlite;
		const { players } = request.body;
		console.log("📦 Contenu complet du body :", request.body);
		if (!Array.isArray(players) || players.length < 2) {
			return reply.status(400).send({ error: "At least two player names are required." });
		}

		try {
			const insertGuest = `INSERT OR IGNORE INTO users (name, is_guest) VALUES (?, ?)`;
			const getUserId = `SELECT id FROM users WHERE name = ?`;
			const insertTournament = `INSERT INTO tournaments (user_id) VALUES (?)`;
			const linkUserToTournament = `INSERT INTO users_join_tournaments (user_id, tournament_id) VALUES (?, ?)`;
			const is_guest = true;
			const userIds = [];

			for (const player of players) {
				 await new Promise ((resolve, reject) => {
					db.run(insertGuest, [player, is_guest], function (err) {
						if (err) return reject(err);
						resolve(null);
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
			const tournamentId = await new Promise((resolve, reject) => {
				db.run(insertTournament, [ownerId], function (err) {
					if (err) return reject(err);
					resolve(this.lastID);
				});
			});

			// Lie chaque utilisateur au tournoi
			for (const uid of userIds) {
				await new Promise((resolve, reject) => {
					db.run(linkUserToTournament, [uid, tournamentId], function (err) {
						if (err) return reject(err);
						resolve(null);
					});
				});
			}

			// Génére les matchs (bracket)
			console.log("generating bracket");
			const matches = generateBracket(userIds);

			// Insére les matchs dans la base
			await Promise.all(
				matches.map(match =>
					new Promise((resolve, reject) => {
						db.run(
							`INSERT INTO matches (tournament_id, user_id, opponent_id, match_round, match_index, score, opponent_score)
							 VALUES (?, ?, ?, ?, ?, 0, 0)`,
							[
								tournamentId,
								match.user_id,
								match.opponent_id,
								match.match_round,
								match.match_index
							],
							(err) => {
								if (err) return reject(err);
								resolve(null);
							}
						);
					}) 
				)
			);
			reply.send({
				message: 'Tournament successfully created.',
				tournamentId,
				userIds,
				matchCount: matches.length,
			});

		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({
				error: 'database POST error',
				details: err.message
			});
		}
	});

	fastify.get('/api/tournaments/:id', async (request, reply) => {
		const db = fastify.sqlite;
		const tournamentId = request.params.id;

		try {
			const matches = await new Promise((resolve, reject) => {
				db.all(
					'SELECT * FROM matches WHERE tournament_id = ?',
					[tournamentId],
					(err, rows) => {
						if (err) return reject(err);
						resolve(rows);
					}
				);
			});

			if (matches.length === 0) {
				return reply.code(404).send({ error: 'No matches found in this tournament' });
			}

			return reply.send({ matches });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: 'Database error' });
		}
	});



	fastify.get('/api/tournaments/:tournament_id/matches', async (request, reply) => {
		const db = fastify.sqlite;
		const { tournament_id } = request.params;

		try {
			const matches = await new Promise((resolve, reject) => {
				db.all(
					`SELECT 
						match_round, match_index,
						user_id, opponent_id
					 FROM matches
					 WHERE tournament_id = ?
					 ORDER BY match_round ASC, match_index ASC`,
					[tournament_id],
					(err, rows) => {
						if (err) return reject(err);
						resolve(rows);
					}
				);
			});

			// Formatage console pour debug lisible
			console.log(`\n=== 🏆 Bracket du tournoi ${tournament_id} ===`);
			let currentRound = -1;
			for (const match of matches) {
				if (match.match_round !== currentRound) {
					currentRound = match.match_round;
					console.log(`\n-- 🥊 Round ${currentRound} --`);
				}
				console.log(`Match ${match.match_index} : ${match.user_id ?? 'VIDE'} vs ${match.opponent_id ?? 'VIDE'}`);
			}
			console.log(`===============================\n`);

			reply.send({ matches });
		} catch (err) {
			fastify.log.error(err);
			reply.code(500).send({ error: 'Erreur récupération des matchs' });
		}
	});

	//advance winner inside bracket
	fastify.post('/api/play/resolve', async (request, reply) => {
		const db = fastify.sqlite;
		const { tournament_id, match_round, match_index, winner_id } = request.body;

		const updateNewUser = `
			UPDATE matches SET user_id = ? WHERE tournament_id = ? AND match_round = ? AND match_index = ?;
		`;

		const updateNewOpponent = `
			UPDATE matches SET opponent_id = ? WHERE tournament_id = ? AND match_round = ? AND match_index = ?;
		`;

		const updateWinnerId = `
			UPDATE matches SET winner_id = ? WHERE tournament_id = ? AND match_round = ? AND match_index = ?;
		`;
		await db.run(updateWinnerId, [winner_id, tournament_id, match_round, match_index]);

		try {
			const match = await new Promise((resolve, reject) => {
				db.get(
					`SELECT * FROM matches
					 WHERE tournament_id = ? AND match_round = ? AND match_index = ?`,
					[tournament_id, match_round + 1, Math.floor(match_index / 2)], (err, row) => {
						if (err) return reject(err);
						resolve(row);
					}
				)
			});
			if (!match) {
				return ;
			}

			//if match_index % 2 === 1 -> winner is 'opponent' of the next round
			//if match_index % 2 === 0 -> winner is 'user' of the next round
			//see notion tournament drawing
			if (match_index % 2) {
				await db.run(updateNewOpponent,	[winner_id, tournament_id, match_round + 1, Math.floor(match_index / 2)]);
			} else {
				await db.run(updateNewUser,		[winner_id, tournament_id, match_round + 1, Math.floor(match_index / 2)]);
			}
			fastify.log.info(`Winner ${winner_id} successfully advanced to next round ${match_round + 1}-${Math.floor(match_index / 2)}!`);
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: 'Database error' });
		}
	});
}

export default gameRoutes
