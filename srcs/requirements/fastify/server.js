// ESM
import Fastify from 'fastify'
import dbConnector from './db_connection/sqlite-connector.js'
import index from './routes/route.js'

const fastify = Fastify({
	logger: true
})

fastify.register(dbConnector)
fastify.register(index)

fastify.listen({port: 3000, host: '0.0.0.0'}, function (err, address) {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	}
	fastify.log.info(`coucou, le server ecoute l'adresse ${address}`)
})
