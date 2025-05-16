async function routes (fastify, options) {
	fastify.get('/health', async (request, reply) => {
			return { hello: 'world' }
			})
	fastify.get('/users', async (request, reply) => {
		const res = await fetch('http://database:3000/users', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: 'Leon' })
		});
		const data = await res.json();
		reply.send(data);
	});
}

export default routes
