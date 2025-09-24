import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';

export default fp(async (fastify) => {
	fastify.register(fastifyJwt, {
		secret: process.env.JWT_SECRET || 'super-secret',
		sign: {
				expiresIn: '1h'
		}
	});

	fastify.decorate("authenticate", async function (request, reply) {
		try {
  console.log("🥵🥵 🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵🥵Cookies received:", request.cookies);
			const token = request.cookies.token;
			const decoded = await fastify.jwt.verify(token);
			request.user = decoded;
console.log("😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱😱 JWT decoded:", decoded.id);
		} catch (err) {
			reply.code(401).send({ error: "Unauthorized" });
		}
	});
});
