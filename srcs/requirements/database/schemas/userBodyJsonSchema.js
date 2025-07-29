const userBodyJsonSchema = {
        type: 'object',
        required: ['name'],
	properties: {
                name: { type: 'string' },
                is_guest: { type: 'integer' },
		google_user: { type: 'integer' },
                email: { type: 'string', format: 'email' },
                password_hash : { type: 'string' },
                reset_token: { type: 'string' },
                reset_expiry: { type: 'integer' },
		twofa_enabled: { type: 'integer' },
		twofa_secret: { type: 'integer' },
                wins: { type: 'integer' },
                losses: { type: 'integer' },
        },
        additionalProperties: false,
};

const schema = {
	body: userBodyJsonSchema,
}

export default schema
