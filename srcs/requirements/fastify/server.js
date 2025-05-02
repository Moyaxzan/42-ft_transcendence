// ESM
import Fastify from 'fastify'
import fastifySqlite from 'fastify-sqlite'
import dbConnector from './db_connection/db.js'
import routes from './routes/route.js'

const fastify = Fastify({
	logger: true
})

fastify.register(fastifySqlite, {
	dbFile: './db_connection/transcendence_db.db'
})

fastify.register(dbConnector)
fastify.register(routes)

fastify.listen({ port: 3000, host: '0.0.0.0' }, function (err, address) {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	} else {
		fastify.log.info(`server is listening on ${address}`)
	}
})
