const userBodyJsonSchema = {
        type: 'object',
        required: ['name'],
	properties: {
                is_guest: { type: 'integer' },
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                id_token: { type: 'string' },
                password_hash : { type: 'string' },
                reset_token: { type: 'string' },
                reset_expiry: { type: 'integer' },
                ip_address: {
			oneOf: [
				{ type: 'string', format: 'ipv4' },
				{ type: 'string', format: 'ipv6' }
			],
		},
                is_log: { type: 'integer' },
                points: { type: 'integer' },
        },
        additionalProperties: false,
};

const schema = {
	body: userBodyJsonSchema,
}

export default schema
