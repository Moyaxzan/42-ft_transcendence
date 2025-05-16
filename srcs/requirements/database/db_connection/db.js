import fastifyPlugin from 'fastify-plugin'

async function dbConnector (fastify, options) {
	fastify.after(() => {
		if (!fastify.sqlite) {
			fastify.log.error("SQLite unavailable")
			return
		}
		fastify.sqlite.exec(`
		create table if not exists users ( \
		id integer primary key autoincrement, \
		name text
		);
		insert into users (id, name) values (0, "Antoine");
		insert into users (name) values ("Jovica");`
		, (err) => {
			fastify.sqlite.all('select * from users', (err, rows) => {
				if (err) {
					fastify.log.warn("'users' table not found" + err.message)
				}  else {
					fastify.log.info({rows}, "'users' table content")
				}
			})
		})
	})
}

export default fastifyPlugin(dbConnector)
