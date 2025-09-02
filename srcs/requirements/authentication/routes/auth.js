// AUTHENTIFICATION CONTAINER

import bcrypt from 'bcrypt'
import qrcode from 'qrcode'
import speakeasy from 'speakeasy'
import { OAuth2Client } from 'google-auth-library';

async function authRoutes (fastify, options) {
	fastify.post('/auth', async (request, reply) => {
		const { email, password } = request.body;

		const res = await fetch(`http://database:3000/api/users/${encodeURIComponent(email)}`, {
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

		if (user.twofa_enabled) {
			if (!user.twofa_secret) {
				return reply.status(403).send({ error: '2FA_SETUP_REQUIRED' });
			}
			return reply.status(403).send({ error: '2FA_REQUIRED' });
		}

		const token = fastify.jwt.sign({
			id: user.id,
			email: user.email,
			name: user.name,
		});

		return reply
			.setCookie('token', token, {
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				path: '/',
			})
			.send({ success: true });
	});

	// fastify.get('auth/me', asyc (request, replay) => {
	// 	try {
	// 		const decoded = await request.jwtVerify();
	// 		reutnr 
	// 	}
	// })
	fastify.post('/register', async (request, reply) => {
		const { email, name, password } = request.body;

		let res = await fetch(`http://database:3000/api/users/${encodeURIComponent(email)}`);
		let user;

		if (res.ok) {
			return reply.code(500).send({ error: 'User already exists', details: text });
		} else {
			const bcrypt = require('bcrypt');
			const saltRounds = 10; //computational cost of hashing
			bcrypt.genSalt(saltRounds, (err, salt) => {
				if (err)
					return reply.code(500).send({ error: 'Error in generating salt', details: text });
			});

			bcrypt.hash(password, salt, (err, hash) => {
				if (err)
					return reply.code(500).send({ error: 'Error in passwd hash', details: text });
			});

			res = await fetch(`http://database:3000/api/users/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, name, hash })
			});
			if (!res.ok) {
				const text = await res.text();
				console.error("Error creating user:", text);
				return reply.code(500).send({ error: 'Could not create user', details: text });
		}
			try {
				user = await res.json();
			} catch (e) {
				console.error("Failed to parse user JSON:", e);
				return reply.code(500).send({ error: 'Invalid JSON from user creation' });
			}
		}

		// const token = fastify.jwt.sign({
		// 	id: user.id,
		// 	email: user.email,
		// 	name: user.name,
		// });

		return reply.send({ success: true });
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

		let res = await fetch(`http://database:3000/api/users/${encodeURIComponent(email)}`);
		let user;

		if (res.ok) {
			user = await res.json();
		} else {
			res = await fetch(`http://database:3000/api/users/google-signin`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, name, google_user: true })
			});
			if (!res.ok) {
				const text = await res.text();
				console.error("Error creating user:", text);
				return reply.code(500).send({ error: 'Could not create user', details: text });
		}
			try {
				user = await res.json();
			} catch (e) {
				console.error("Failed to parse user JSON:", e);
				return reply.code(500).send({ error: 'Invalid JSON from user creation' });
			}
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


	fastify.post('/auth/2fa/setup', async (request, reply) => {
		const { email, password } = request.body;

		if (!email || !password)
			return reply.code(400).send({ error: 'Email and password required' });

		const res = await fetch(`http://database:3000/api/users/${encodeURIComponent(email)}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});

		if (!res.ok)
			return reply.code(401).send({ error: 'User not found' });

		const user = await res.json();

		const secret = speakeasy.generateSecret({ name: `ft_transcendance (${user.email})` });
		console.log("ERROR : Generated otpauth URL:", secret.otpauth_url);

		const patchRes = await fetch(`http://database:3000/api/users/${user.id}/2fa-secret`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ secret: secret.base32 }),
		});

		if (!patchRes.ok) {
			const errText = await patchRes.text();
			console.error('ERROR : failed to save 2FA secret:', patchRes.status, errText);
			return reply.code(500).send({ error: 'Failed to update 2FA secret in database' });
		}

		let qrCodeUrl;
		try {
			qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
		}
		catch (err) {
			console.error("Failed to generate QR code:", err);
			return reply.code(500).send({ error: 'Failed to generate QR code' });
		}

		return reply.send({ qrCodeUrl, secret: secret.base32 });
	});

	fastify.post('/auth/2fa/verify', async (request, reply) => {
		const { token, email, password } = request.body;

		const resUser = await fetch(`http://database:3000/api/users/${encodeURIComponent(email)}`);
		if (!resUser.ok)
			return reply.code(401).send({ error: 'User not found' });

		const user = await resUser.json();

		if (!user.twofa_secret)
			return reply.code(400).send({ error: '2FA not set up' });

		const verified = speakeasy.totp.verify({
			secret: user.twofa_secret,
			encoding: 'base32',
			token,
			window: 1
		});

		if (!verified)
			return reply.code(400).send({ error: 'Invalid 2FA code' });

		const jwt = fastify.jwt.sign({
			id: user.id,
			email: user.email,
			name: user.name
		});

		return reply
			.setCookie('token', jwt, {
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				path: '/'
			})
			.send({ success: true });
	});

	fastify.get('/auth/google/client-id', async (request, reply) => {
		return { clientId: process.env.GOOGLE_CLIENT_ID };
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
