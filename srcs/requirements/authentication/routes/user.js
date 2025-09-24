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

	fastify.get('/api/me',
	{ preValidation: [fastify.authenticate] },
	async (request, reply) => {
		try {
			const userId = request.user.id; // ajouté par fastify.authenticate (via JWT)
			// récupérer l'utilisateur depuis ta DB interne
			const res = await fetch(`http://database:3000/api/users/${userId}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
			});
			if (!res.ok) {
				return reply.code(404).send({ error: 'User not found' });
			}
			const user = await res.json();

			// supprimer le password avant de renvoyer
			delete user.password;
			delete user.password_hash;

			return reply.send(user);
		} catch (err) {
			console.error("ERROR /api/me:", err);
			return reply.code(500).send({ error: 'Internal Server Error' });
		}
	})
}

export default userRoutes
