import fastifyPlugin from 'fastify-plugin'
import fs from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function dbConnector (fastify, options) {
        const sqlitePath = path.join(__dirname, 'init.sql')
        let db
        try {
                db = await fs.readFile(sqlitePath, "utf8")
        } catch (err) {
                fastify.log.error(`Error reading file init.sql: ${err.message}`)
                return
        }
        fastify.after(() => {
                if (!fastify.sqlite) {
                        fastify.log.error("SQLite unavailable")
                        return
                }
                fastify.sqlite.exec(db, (err) => {
			if (err) {
				fastify.log.warn(`Error executing SQLite: ${err.message}`)
				return
			}
			const tables = ['users', 'matches', 'tournaments']
			tables.forEach((table) => {
                        	fastify.sqlite.all(`SELECT * FROM ${table}`, (err, rows) => {
                                	if (err) {
                                        	fastify.log.warn(`${table} not found ` + err.message)
                                	}  else {
                                        	fastify.log.info({rows}, `${table} content`)
                               	 	}
                        	})
			})
                })
        })
}

export default fastifyPlugin(dbConnector)
