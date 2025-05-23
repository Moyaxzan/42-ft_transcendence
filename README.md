All containers
---------------
```GET /health``` Check if container is connected to nginx


database container
---------------
In this container (in ```routes/route.js```), you will find all the routes availables <br><br>
```fastify.addHook``` => Middleware function <br>
```GET /users``` => Select all users <br>
```POST /users/login``` => Add a user, used by **authentication** container <br>
```PATCH /users/:id``` => Update points, used by **pong** container <br>
```DELETE /users/:id``` => Delete user, used by **authentication** container <br>
