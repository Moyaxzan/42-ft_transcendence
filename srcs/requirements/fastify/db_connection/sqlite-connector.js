import fastifyPlugin from 'fastify-plugin'
import sqlite3 from 'sqlite3'

async function dbConnector (fastify, options) {
	const db = new sqlite3.Database('./transcendence_db.sqlite', (err) => {
		if (err) {
			fastify.log.error('Failed to open transcendence_db.sqlite', err)
		} else {
			fastify.log.info('Success!')
		}
	})
	fastify.decorate('sqlite', db)
}

export default fastifyPlugin(dbConnector)
