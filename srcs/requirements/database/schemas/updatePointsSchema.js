const updatePointsSchema = {
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
 			id: { type: 'string' },
 		},
		additionalProperties: false
 	}
 };

export default updatePointsSchema
