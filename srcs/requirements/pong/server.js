// ESM
import Fastify from 'fastify'
import routes from './routes/pong_route.js'

const fastify = Fastify({
	logger: true
})

fastify.register(routes)

fastify.listen({ port: 3000, host: '0.0.0.0' }, function (err, address) {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	} else {
		fastify.log.info(`server is listening on ${address}`)
	}
})
