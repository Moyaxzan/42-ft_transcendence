async function routes (fastify, options) {
	fastify.get('/health', async (request, reply) => {
		return { hello: 'world' }
	})

	const userBodyJsonSchema = {
		type: 'object',
		required: [ 'name'],
		properties: {
			name: { type: 'string' },
		},
	}
	const schema = {
		body: userBodyJsonSchema,
	}

	fastify.post('/users', { schema }, async (request, reply) => {
		const res = await fetch('http://database:3000/users', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name: request.body.name })
	});
 	const data = await res.json();
  	reply.send(data);
	})
}

export default routes
