// AUTHENTIFICATION CONTAINER

async function routes (fastify, options) {
	fastify.get('/health', async (request, reply) => {
		return { hello: 'world' }
	})

	const userBodyJsonSchema = {
		type: 'object',
		required: [ 'name', 'id_token' ],
		properties: {
			name: { type: 'string' },
			id_token: { type: 'string' },
		},
	}

	const schema = {
		body: userBodyJsonSchema,
	}

	fastify.post('/users/login', { schema }, async (request, reply) => {
		const res = await fetch('http://database:3000/users/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: request.body.name, id_token: request.body.id_token })
		});
 		const data = await res.json();
  		reply.send(data);
	})

	fastify.delete('/users/:id', { schema }, async (request, reply) => {
		const { id } = request.params;
		const res = await fetch(`http://database:3000/users/${encodeURIComponent(id)}`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
	});
	 	const data = await res.json();
	})
}

export default routes
