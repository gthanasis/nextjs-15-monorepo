// ImageJsonSchema.ts
const ImageJsonSchema = {
    type: 'object',
    properties: {
        fileName: {
            type: 'string',
            minLength: 1
        }
    },
    required: ['fileName'],
    additionalProperties: false
}

export default ImageJsonSchema
