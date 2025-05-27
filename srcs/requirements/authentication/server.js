// ESM
import Fastify from 'fastify'
import jwtPlugin from './plugins/jwt.js';
import authRoutes from './routes/route.js';
import protectedRoutes from './routes/protected.js';

const fastify = Fastify({
	logger: true
})

fastify.register(jwtPlugin);
fastify.register(authRoutes);
fastify.register(protectedRoutes, { prefix: '/users' });

fastify.listen({ port: 3000, host: '0.0.0.0' }, function (err, address) {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	} else {
		fastify.log.info(`server is listening on ${address}`)
	}
})
