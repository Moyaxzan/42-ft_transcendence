import Fastify from 'fastify';
import elasticsearchRoutes from './routes/elasticsearch.js'

const fastify = Fastify({
	logger: true
});

fastify.register(elasticsearchRoutes)

fastify.listen({ port: 3000, host: '0.0.0.0' })
.then(() => {
	fastify.log.info('server deployed on port 3000');
})
.catch(err => {
	fastify.log.error(err);
		process.exit(1);
});