const dotenv = require('dotenv');
const path = require('path');
const { z } = require('zod');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = z.object({
    NODE_ENV: z.enum(['production', 'development', 'test']),
    PORT: z.coerce.number().default(5001),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    JWT_ACCESS_EXPIRATION_MINUTES: z.coerce.number().default(30),
});

const parsedEnvResult = envVarsSchema.safeParse(process.env);

if (!parsedEnvResult.success) {
    const errorMessage = parsedEnvResult.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
    throw new Error(`Config validation error: ${errorMessage}`);
}

const envVars = parsedEnvResult.data;

module.exports = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    databaseUrl: envVars.DATABASE_URL,
    jwt: {
        secret: envVars.JWT_SECRET,
        accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    },
};