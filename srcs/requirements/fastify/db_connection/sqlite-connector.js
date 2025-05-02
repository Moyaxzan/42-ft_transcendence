import fastifyPlugin from 'fastify-plugin'
//import { open } from 'sqlite'
import sqlite3 from 'sqlite3'
//import { open } from 'sqlite'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const texts = sqliteTable('texts', {
  id: text('id', { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  cmsKey: text('cms_key').notNull(),
  value: text('value').notNull(),
});
async function dbConnector (fastify, options) {
	const db = new sqlite3.Database('./transcendence_db.sqlite', (err) => {
		if (err) {
			fastify.log.error('Failed to open transcendence_db.sqlite', err)
		} else {
			fastify.log.info('Success!')
		}
	})

/*
  db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS users ( \
        id INTEGER PRIMARY KEY AUTOINCREMENT, \
        name TEXT NOT NULL \
      )");
    })
*/
 // })
	fastify.decorate('sqlite', db)
}

export default fastifyPlugin(dbConnector)
