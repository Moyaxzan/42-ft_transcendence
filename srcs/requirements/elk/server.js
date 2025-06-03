import Fastify from 'fastify'
import elasticSearchRoutes from './routes/elasticsearch.js';

const fastify = Fastify({
	logger: true
})

fastify.register(elasticSearchRoutes);

fastify.listen({port: 3000, host: '0.0.0.0'}, function (err, address) {
	if (err) {
		fastify.log.error(err);
		process.exit(1)
	} else {
		fastify.log.info(`server is listening on ${address}`)
	}
})
