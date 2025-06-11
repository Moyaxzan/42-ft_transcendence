// PONG CONTAINER

async function routes (fastify, options) {
	fastify.get('/health', async (request, reply) => {
		return { hello: 'world' }
	})

	fastify.patch('/users/points/:id', async (request, reply) => {
		const res = await fetch(`http://database:3000/users/points/${encodeURIComponent(id)}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: request.body.id, points: request.body.points })
		});
 		const data = await res.json();
  		reply.send(data);
	})

	fastify.delete('/users/:id', async (request, reply) => {
		const res = await fetch(`http://database:3000/users/${encodeURIComponent(id)}`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
	});
	 	const data = await res.json();
	})

	fastify.post('/users/history/:id', async (request, reply) => {
		const res = await fetch(`http://database:3000/users/history/${encodeURIComponent(id)}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: request.body.id, score: request.body.score, opponent_score: request.body.opponent_score })
		});
 		const data = await res.json();
  		reply.send(data);
	})

	 fastify.get('/matches/:match_round/:match_index', async (request, reply) => {
		const res = await fetch(`http://database:3000/matches/${match_round}/${match_index}`);
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
}

export default routes
