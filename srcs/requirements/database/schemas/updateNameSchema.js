const updateNameSchema = {
    body: {
        type: 'object',
        required: ['name'],
        properties: {
            name: { type: 'string' },
        },
        additionalProperties: false
    },
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' },
        },
        additionalProperties: false
    }
}

export default updateNameSchema