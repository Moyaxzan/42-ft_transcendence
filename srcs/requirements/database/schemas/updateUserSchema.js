const updateUserSchema = {
	body: {
		type: 'object',
		required: ['points'],
		properties: {
			points: { type: 'integer' },
		},
		additionalProperties: false
	},
	params: {
		type: 'object',
		required: ['id'],
		properties: {
			id: { type: 'integer' },
		}
	}
}

/*
const schema = {
        body: userBodyJsonSchema,
}
*/

export default updateUserSchema
