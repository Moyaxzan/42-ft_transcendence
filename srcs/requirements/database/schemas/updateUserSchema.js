const updatPointsSchema = {
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

export default updateUserSchema
