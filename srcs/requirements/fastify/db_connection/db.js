import fastifyPlugin from 'fastify-plugin'

async function dbConnector (fastify, options) {
	fastify.after(() => {
		if (!fastify.sqlite) {
			fastify.log.error("SQLite n'est pas dispo !")
			return
		}
		fastify.sqlite.exec(`
		create table if not exists test ( \
		id integer primary key autoincrement, \
		name text
		);`
		, (err) => {
//		fastify.sqlite.all('select * from test', (err, rows) => {
			if (err) {
				fastify.log.warn("Table 'test' introuvable" + err.message)
			//}  else {
			//	fastify.log.info({rows}, "contenu de la table test")
			}
		})
	})
}

export default fastifyPlugin(dbConnector)
