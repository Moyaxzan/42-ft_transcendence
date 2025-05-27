//AUTHENTICATION CONTAINER

export default async function protectedRoutes(fastify) {
  fastify.get('/profile', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    reply.send({ user: request.user });
  });
}
