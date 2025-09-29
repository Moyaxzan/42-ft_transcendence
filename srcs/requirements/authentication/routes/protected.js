//AUTHENTICATION CONTAINER

export default async function protectedRoutes(fastify) {
	fastify.get('/auth/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		const { email } = request.user;

		const res = await fetch(`http://database:3000/api/users/${encodeURIComponent(email)}`, {
			method: 'GET',
		});

		if (!res.ok) {
			return reply.code(404).send({ error: 'User not found' });
		}

		const user = await res.json();

		return {
			name: user.name,
			wins: user.wins,
			losses: user.losses,
			twofa_enabled: user.twofa_enabled
		};
	});
}
