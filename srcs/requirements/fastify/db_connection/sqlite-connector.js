import fastifyPlugin from 'fastify-plugin'
import sqlite3 from 'sqlite3'
//import { open } from 'sqlite'

async function dbConnector (fastify, options) {
	const db = new sqlite3.Database('../sqlite/transcendece_db.sqlite', (err) => {
		if (err) {
			fastify.log.error('Failed ta mere', err)
		} else {
			fastify.log.error('C\'est okay')
		}
	})
	fastify.decorate('sqlite', db)
}

export default fastifyPlugin(dbConnector)
