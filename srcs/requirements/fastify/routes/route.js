async function routes(fastify, options) {
  fastify.get('/', async (request, reply) => {
		return { hello: 'world'}
   // const users = await fastify.sqlite.all('SELECT * FROM users')
  // return { users }
  })

/*
  fastify.post('/user', async (request, reply) => {
    const { name } = request.body
    await fastify.sqlite.run('INSERT INTO users (name) VALUES (?)', name)
    return { success: true }
  })

*/
}


export default routes
