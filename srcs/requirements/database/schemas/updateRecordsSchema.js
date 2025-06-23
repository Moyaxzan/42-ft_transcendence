const updateRecordsSchema = {
 	body: {
 		type: 'object',
 		required: ['wins', 'losses'],
 		properties: {
 			wins: { type: 'integer' },
			losses: { type: 'integer' },
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

export default updateRecordsSchema
