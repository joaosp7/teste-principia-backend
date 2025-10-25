import {z} from 'zod';

import * as dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  ENVIRONMENT: z.enum(['production', 'dev']).optional().default('dev'),
  POSTGRES_HOST: z.string().optional().default('localhost'),
  POSTGRES_PORT: z.string().transform(Number).default(5432),
  POSTGRES_DB: z.string(),
  POSTGRES_USER: z.string().optional().default('postgres'),
  POSTGRES_PASSWORD: z.string(),
  PORT: z.string().transform(Number).default(3000),

})

const envParse = envSchema.safeParse(process.env);

if (!envParse.success){
  console.error(envParse.error.message);
  throw new Error('Problem with env variables. Please try again.');
}

export const env = envParse.data;