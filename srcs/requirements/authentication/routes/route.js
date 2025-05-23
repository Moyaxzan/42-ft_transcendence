// AUTHENTIFICATION CONTAINER

/*
async function routes (fastify, options) {
	fastify.get('/health', async (request, reply) => {
		return { hello: 'world' }
	})

	const userBodyJsonSchema = {
		type: 'object',
		required: [ 'is_ia', 'name', 'email', 'id_token', 'password_hash', 'reset_token', 'reset_expiry', 'ip_address', 'is_log', 'points' ],
		properties: {
			is_ia: { type: 'integer' },
			name: { type: 'string' },
			email: { type: 'string' },
			id_token: { type: 'string' },
			password_hash : { type: 'string' },
			reset_token: { type: 'string' },
			reset_expiry: { type: 'integer' },
			ip_address: { type: 'string' },
			is_log: { type: 'integer' },
			points: { type: 'integer' },
		},
		additionalProperties: false
	}

	const schema = {
		body: userBodyJsonSchema,
	}

	fastify.post('/users/login', { schema }, async (request, reply) => {
		const { is_ia, name, email, id_token, password_hash, reset_token, reset_expiry, ip_address, is_log, points } = request.body; 
		const res = await fetch('http://database:3000/users/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({is_ia, name, id_token, email, id_token, password_hash, reset_token, reset_expiry, ip_address, is_log, points})
		});
 		const data = await res.json();
  		reply.send(data);
	})

	fastify.delete('/users/:id', { schema }, async (request, reply) => {
		const { id } = request.params;
		const res = await fetch(`http://database:3000/users/${encodeURIComponent(id)}`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
	});
	 	const data = await res.json();
	})
}

export default routes
*/


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
}

export default routes
