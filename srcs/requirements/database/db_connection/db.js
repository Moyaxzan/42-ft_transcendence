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
		is_ia NUMERIC DEFAULT 0, \
		name TEXT UNIQUE NOT NULL, \
		email TEXT UNIQUE DEFAULT NULL, \
		id_token TEXT UNIQUE DEFAULT NULL, \
		password_hash TEXT UNIQUE DEFAULT NULL, \
		reset_token TEXT UNIQUE DEFAULT NULL, \
		reset_expiry NUMERIC DEFAULT 0, \
		ip_address TEXT NOT NULL, \
		is_log NUMERIC DEFAULT 0, \
		points INTEGER DEFAULT 0
		);
		INSERT INTO users (id, name, email, id_token, password_hash, ip_address) VALUES (0, "Antoine", "test@gmail.com", "null", "hash", "127.0.0.1");
		INSERT INTO users (name, ip_address) VALUES ("Jovica", "127.0.0.1");`
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
