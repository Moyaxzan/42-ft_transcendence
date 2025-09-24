// ESM
import Fastify from 'fastify'
import jwtPlugin from './plugins/jwt.js';
import healthRoutes from './routes/health.js';
import userRoutes from './routes/user.js';
import protectedRoutes from './routes/protected.js';
import authRoutes from './routes/auth.js';
import cookie from '@fastify/cookie'
import cors from '@fastify/cors';


const fastify = Fastify({
	logger: true
})

fastify.register(cors, {
  origin: true,
  credentials: true
});

fastify.register(cookie, {
	// secret: 'test',
	parseOptions: {}
});

//fastify.register(cookie);
fastify.register(jwtPlugin);
fastify.register(healthRoutes);
fastify.register(userRoutes);
fastify.register(authRoutes);
fastify.register(protectedRoutes);

fastify.listen({ port: 3000, host: '0.0.0.0' }, function (err, address) {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	} else {
		fastify.log.info(`server is listening on ${address}`)
	}
})
