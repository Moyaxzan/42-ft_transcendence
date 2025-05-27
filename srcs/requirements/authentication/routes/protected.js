//AUTHENTICATION CONTAINER

export default async function protectedRoutes(fastify) {
  fastify.get('/profile', { preValidation: [fastify.authenticate] }, async (request) => {
    return { user: request.user };
  });
}
