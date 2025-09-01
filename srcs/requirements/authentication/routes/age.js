async function age (fastify, option) {
    fastify.get('/api/users/:id'), async (request, reply) => {
        const { id } = request.params;
        const res = await fetch(`http://database:3000/api/users/${encodeURIComponent(id)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json'},
        });
            const data = await res.json(); 
            return reply.send(data);
    }
}


export default age