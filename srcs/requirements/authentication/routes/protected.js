//AUTHENTICATION CONTAINER

export default async function protectedRoutes(fastify) {
	fastify.get('/auth/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		const { email } = request.user;

		const user = await fetch(`http://database:3000/users/${encodeURIComponent(email)}`, {
			method: 'GET',
		})
		
		if (!user) {
			return reply.code(404).send( { error: 'User not found' } );
		}
		return {
			username: user.username,
			email: user.email,
			points: user.points
		}
	});
}
