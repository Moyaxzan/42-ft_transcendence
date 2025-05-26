// PONG CONTAINER

async function routes (fastify, options) {
	fastify.get('/health', async (request, reply) => {
		return { hello: 'world' }
	})

	fastify.patch('/users/points/:id', async (request, reply) => {
		const res = await fetch(`http://database:3000/points/${encodeURIComponent(id)}`, {
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
}

export default routes
