// AUTHENTIFICATION CONTAINER

import bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library';

async function authRoutes (fastify, options) {
	fastify.post('/auth', async (request, reply) => {
		const { email, password } = request.body; 
		const res = await fetch(`http://database:3000/users/${encodeURIComponent(email)}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});

		if (!res.ok) {
			return reply.status(401).send({ message: 'User not found in database' });
		}

 		const user = await res.json();

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

  	return	reply
		.setCookie('token', token, {
	  		httpOnly: true, //protege du xss
	  		secure: true, //remettre false si ça bug a cause du https
	  		sameSite: 'lax',
	  		path: '/'
		})
		.send({ success: true });
	});

	fastify.post('/auth/google', async (request, reply) => {
		const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
		const { token } = request.body;
		if (!token)
			return reply.code(400).send({ error: 'Missing Google token' });

		let ticket;
		try {
			ticket = await client.verifyIdToken({
				idToken: token,
				audience: process.env.GOOGLE_CLIENT_ID
			});
		} catch (e) {
			console.error("Google token verification failed:", e);
			return reply.code(401).send({ error: 'Invalid Google token' });
		}

		const payload = ticket.getPayload();
		if (!payload)
			return reply.code(400).send({ error: 'Invalid Google payload' });

		const email = payload.email;
		const name = payload.name;

		let res = await fetch(`http://database:3000/users/${encodeURIComponent(email)}`);
		let user;

		if (res.ok) {
			user = await res.json();
		} else {
			res = await fetch(`http://database:3000/users`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, name, google_user: true }) // À toi de voir ton modèle exact
			});
			if (!res.ok)
				return reply.code(500).send({ error: 'Could not create user' });
			user = await res.json();
		}

		const jwt = fastify.jwt.sign({
			id: user.id,
			email: user.email,
			name: user.name
		});

		reply
			.setCookie('token', jwt, {
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				path: '/'
			})
			.send({ success: true });
	});

	fastify.post('/refresh', async (request, reply) => {
 		const refreshToken = request.cookies.refreshToken;

  		try {
			const payload = fastify.jwt.verify(refreshToken);
			const newAccessToken = fastify.jwt.sign(
	  			{ id: payload.id, email: payload.email },
	  			{ expiresIn: '15m' }
			);
			return reply.send({ accessToken: newAccessToken });
  		} catch (err) {
			return reply.code(401).send({ error: 'Invalid refresh token' });
  		}
	});

	fastify.post('/auth/logout', (request, reply) => {
		reply
		.clearCookie('token', { path: '/' })
		.send({ success: true });
	});

// <<<<<<< HEAD:srcs/requirements/authentication/routes/route.js

// 	fastify.delete('/users/:id', async (request, reply) => {
// 		const { id } = request.params;
// 		const res = await fetch(`http://database:3000/users/${encodeURIComponent(id)}`, {
// 			method: 'DELETE',
// 			headers: { 'Content-Type': 'application/json' },
// 	});
// 	 	const data = await res.json();
// 		return reply.send(data);
// 	})

// 	fastify.patch('/users/:id', async (request, reply) => {
// 		const { id } = request.params;
// 		const { name } = request.body;
// 		const res = await fetch(`http://database:3000/users/${encodeURIComponent(id)}`, {
// 			method: 'PATCH',
// 			headers: { 'Content-Type': 'application/json' },
// 			body: JSON.stringify({ name: request.body.name })
// 		});
// 		const data = await res.json();
// 		reply.send(data);
// 	})

// 	fastify.get('/users/history/:id', async (request, reply) => {
// 		const { id } = request.params;
// 		const db = fastify.sqlite;

// 		const matches = await db.all(`
// 			SELECT score, opponent_score, opponent_username
// 			FROM matches
// 			WHERE user_id = ?`, [id]);
		
// 		reply.sent(matches);
// 	})
// =======
// >>>>>>> 85a24b70484f1f70ce8c5c67164290f23f4d2651:srcs/requirements/authentication/routes/auth.js
}

export default authRoutes
