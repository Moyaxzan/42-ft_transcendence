// AUTHENTIFICATION CONTAINER

async function userRoutes (fastify, options) {
	fastify.delete('/api/users/:id', async (request, reply) => {
		const { id } = request.params;
		const res = await fetch(`http://database:3000/api/users/${encodeURIComponent(id)}`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
	});
	 	const data = await res.json();
		return reply.send(data);
	})

	fastify.patch('/api/users/:id', async (request, reply) => {
		const { id } = request.params;
		const { name } = request.body;
		const res = await fetch(`http://database:3000/api/users/${encodeURIComponent(id)}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: request.body.name })
		});
		const data = await res.json();
		reply.send(data);
	})
  
  fastify.patch('/auth/2fa/toggle', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { enabled } = request.body;
    const userId = request.user.id; // récupéré depuis le JWT

    try {
        // Appel HTTP vers le container DB
        const res = await fetch(`http://database:3000/api/users/2fa-toggle`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ enabled, id: userId })
        });

        const data = await res.json();
        if (!res.ok) return reply.status(res.status).send(data);

        return reply.send(data);
    } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}

export default userRoutes
