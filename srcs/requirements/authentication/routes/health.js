// AUTHENTIFICATION CONTAINER

async function healthRoutes (fastify, options) {
	fastify.get('/health', async (request, reply) => {
		return { hello: 'world' }
	});
}

export default healthRoutes
