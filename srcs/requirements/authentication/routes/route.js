// AUTHENTIFICATION CONTAINER

async function routes (fastify, options) {
	fastify.get('/health', async (request, reply) => {
		return { hello: 'world' }
	})

	fastify.post('/users/login', async (request, reply) => {
		const { is_ia, name, email, id_token, password_hash, reset_token, reset_expiry, ip_address, is_log, points } = request.body; 
		const res = await fetch('http://database:3000/users/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({is_ia, name, id_token, email, id_token, password_hash, reset_token, reset_expiry, ip_address, is_log, points})
		});
 		const data = await res.json();
  		reply.send(data);
	})

	fastify.delete('/users/:id', async (request, reply) => {
		const { id } = request.params;
		const res = await fetch(`http://database:3000/users/${encodeURIComponent(id)}`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
	});
	 	const data = await res.json();
	})

	fastify.patch('/users/:id', async (request, reply) => {
		const { id } = request.params;
		const { name } = request.body;
		const res = await fetch(`http://database:3000/users/${encodeURIComponent(id)}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: request.body.name })
		});
		const data = await res.json();
		reply.send(data);
	})
}

export default routes
