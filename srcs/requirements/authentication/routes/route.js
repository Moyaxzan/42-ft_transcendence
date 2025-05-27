// AUTHENTIFICATION CONTAINER

import bcrypt from 'bcrypt'

async function routes (fastify, options) {
	fastify.get('/health', async (request, reply) => {
		return { hello: 'world' }
	})

	fastify.post('/auth/login', async (request, reply) => {
		const { email, password } = request.body; 
		const res = await fetch(`http://database:3000/users/${encodeURIComponent(email)}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});

		if (!res.ok) {
        	return reply.status(401).send({ message: 'User not found in database' });
    	}

 		const user = await res.json();
		console.log('User from DB:', user);
		if (!user || !user.password_hash) {
			return reply.status(401).send({ message: 'User not found in database' });
		}
		
		const match = await bcrypt.compare(password, user.password_hash);
		if (!match) {
			return reply.status(401).send({ message: 'Incorrect password' });
		}

		const token = fastify.jwt.sign({
			id: user.id,
			email: user.email,
			name: user.name,
		});

  		return reply.send({token});
	})

	fastify.delete('/users/:id', async (request, reply) => {
		const { id } = request.params;
		const res = await fetch(`http://database:3000/users/${encodeURIComponent(id)}`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
	});
	 	const data = await res.json();
		return reply.send(data);
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
