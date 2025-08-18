// ESM
import Fastify from 'fastify'
import fastifySqlite from 'fastify-sqlite'
import dbConnector from './db_connection/db.js'
import routes from './routes/route.js'
import authRoutes from './routes/auth.js'
import gameRoutes from './routes/game.js'
import net from 'net'

const LOGSTASH_HOST = 'logstash'
const LOGSTASH_PORT = 5000

const logstashSocket = new net.Socket()

logstashSocket.connect(LOGSTASH_PORT, LOGSTASH_HOST, () => {
	console.log('Connected to Logstash')
})

logstashSocket.on('error', (err) => {
	console.error('Logstash connection error:', err)
})

const fastify = Fastify({
	logger: {
		level: 'info',
		stream: {
			write: (msg) => {
 				if (logstashSocket.writable) {
    				logstashSocket.write(msg.endsWith('\n') ? msg : msg + '\n')
  				}
			}
		}	
	},
	ajv: {
		customOptions: {
			coerceTypes: false
		}
	}
})

fastify.register(fastifySqlite, {
	dbFile: './data/transcendence_db.db'
})


fastify.register(dbConnector)
fastify.register(routes)
fastify.register(authRoutes)
fastify.register(gameRoutes)

fastify.listen({ port: 3000, host: '0.0.0.0' }, function (err, address) {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	} else {
		fastify.log.info(`server is listening on ${address}`)
	}
})
