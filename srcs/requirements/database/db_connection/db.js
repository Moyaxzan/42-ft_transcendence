import fastifyPlugin from 'fastify-plugin'

async function dbConnector (fastify, options) {
	fastify.after(() => {
		if (!fastify.sqlite) {
			fastify.log.error("SQLite unavailable")
			return
		}
		fastify.sqlite.exec(`
		CREATE TABLE IF NOT EXISTS users ( \
		id INTEGER PRIMARY KEY AUTOINCREMENT, \
		name TEXT UNIQUE, \
		id_token TEXT UNIQUE, \
		email TEXT UNIQUE NOT NULL
		);
		INSERT INTO users (id, name, id_token, email) VALUES (0, "Antoine", "null", "test@gmail.com");
		INSERT INTO users (name, id_token, email) VALUES ("Jovica", "undefined", "test2");`
		, (err) => {
			fastify.sqlite.all('SELECT * FROM users', (err, rows) => {
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
