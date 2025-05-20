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
		name text, \
		id_token text
		);
		insert into users (id, name, id_token) values (0, "Antoine", "null");
		insert into users (name, id_token) values ("Jovica", "null");`
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
