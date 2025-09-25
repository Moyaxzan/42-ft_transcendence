// PONG CONTAINER

async function routes (fastify, options) {
	fastify.get('/health', async (request, reply) => {
		return { hello: 'world' }
	})

	// fastify.patch('/api/users/wins/:id', async (request, reply) => {
	// 	const res = await fetch(`http://database:3000/api/users/wins/${encodeURIComponent(id)}`, {
	// 		method: 'PATCH',
	// 		headers: { 'Content-Type': 'application/json' },
	// 		body: JSON.stringify({ id: request.body.id, wins: request.body.wins, losses: request.body.losses })
	// 	});
 	// 	const data = await res.json();
  	// 	reply.send(data);
	// })

	// fastify.patch('/api/users/losses/:id', async (request, reply) => {
	// 	const res = await fetch(`http://database:3000/api/users/losses/${encodeURIComponent(id)}`, {
	// 		method: 'PATCH',
	// 		headers: { 'Content-Type': 'application/json' },
	// 		body: JSON.stringify({ id: request.body.id, wins: request.body.wins, losses: request.body.losses })
	// 	});
 	// 	const data = await res.json();
  	// 	reply.send(data);
	// })

	fastify.delete('/api/users/:id', async (request, reply) => {
		const res = await fetch(`http://database:3000/api/users/${encodeURIComponent(id)}`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
	});
	 	const data = await res.json();
	})

	// fastify.post('/api/users/history/:id', async (request, reply) => {
	// 	const {id} = request.params;
	// 	const res = await fetch(`http://database:3000/api/users/history/${encodeURIComponent(id)}`, {
	// 		method: 'POST',
	// 		headers: { 'Content-Type': 'application/json' },
	// 		body: JSON.stringify({ id: request.body.id, score: request.body.score, opponent_score: request.body.opponent_score })
	// 	});
 	// 	const data = await res.json();
  	// 	reply.send(data);
	// })

	 //fastify.get('/api/matches/:match_round/:match_index', async (request, reply) => {
	 fastify.get('/api/play/:match_round/:match_index', async (request, reply) => {
		const res = await fetch(`http://database:3000/api/matches/${match_round}/${match_index}`);
		if (!res.ok) return reply.code(res.status).send(await res.text());
		const matches = await res.json();
		reply.send(matches);
	 });

	// fastify.get('/users/history/:id', async (request, reply) => {
	// 	const { id } = request.params;
	// 	const res = await fetch(`http://database:3000/users/history/${encodeURIComponent(id)}`);
	// 	if (!res.ok) return reply.code(res.status).send(await res.text());
	// 	const matches = await res.json();
	// 	reply.send(matches);
	// });

	fastify.post('/api/tournaments', async (request, reply) => {
		const res = await fetch(`http://database:3000/api/tournaments`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ user_id: request.body.user_id, tournament_id: request.body.tournament_id })
		});
 		const data = await res.json();
  		reply.send(data);
	})

}

export default routes
