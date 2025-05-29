// AUTHENTIFICATION CONTAINER

async function userRoutes (fastify, options) {
	fastify.delete('/users/:id', async (request, reply) => {
		const { id } = request.params;
		const res = await fetch(`http://database:3000/users/${encodeURIComponent(id)}`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
	});
	 	const data = await res.json();
		return reply.send(data);
	})

	fastify.patch('/users/:id', async (request, reply) => {
		const { id } = request.params;
		const { name } = request.body;
		const res = await fetch(`http://database:3000/users/${encodeURIComponent(id)}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: request.body.name })
		});
		const data = await res.json();
		reply.send(data);
	})
}

export default userRoutes
