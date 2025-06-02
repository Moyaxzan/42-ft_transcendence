async function elasticsearchRoutes (fastify, options) {
	fastify.get('/users/name', async (request, reply) => {
		const {name} = request.query;
		const res = await fetch('http://elasticsearch:9200/users/_search', {
			method: 'POST',	
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				query: {
					match: {
						name: name
					}
				}
			})
		});
		const data = await res.json();
		reply.send(data);
	})

fastify.get('/sync', async (request, reply) => {
  try {
    const response = await fetch('http://database:3000/users');
    const users = await response.json();

    for (const user of users) {
      await fetch(`http://elasticsearch:9200/users/user/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
    }

    reply.send({ message: `${users.length} users indexés dans Elasticsearch.` });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: 'Erreur lors du sync' });
  }
});

}

export default elasticsearchRoutes
