import Joi from "joi";

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  DATABASE_URL: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default("7d"),
  AWS_REGION: Joi.string().required(),
  S3_BUCKET_NAME: Joi.string().required(),
  S3_SIGNED_URL_EXPIRY_TIME: Joi.number().integer().positive().default(86400),
  NEXTAUTH_SECRET: Joi.string().required(),
  NEXTAUTH_URL: Joi.string().uri().optional(),
}).unknown();

const { value, error } = envSchema
  .prefs({ abortEarly: false, convert: true })
  .validate(process.env);

if (error) {
  const details = error.details.map((detail) => `- ${detail.message}`).join("\n");
  throw new Error(`Invalid environment variables:\n${details}`);
}

export type Env = {
  NODE_ENV: "development" | "production" | "test";
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  AWS_REGION: string;
  S3_BUCKET_NAME: string;
  S3_SIGNED_URL_EXPIRY_TIME: number;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL?: string;
};

export const env: Env = {
  NODE_ENV: value.NODE_ENV,
  DATABASE_URL: value.DATABASE_URL,
  JWT_ACCESS_SECRET: value.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: value.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: value.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: value.JWT_REFRESH_EXPIRES_IN,
  AWS_REGION: value.AWS_REGION,
  S3_BUCKET_NAME: value.S3_BUCKET_NAME,
  S3_SIGNED_URL_EXPIRY_TIME: value.S3_SIGNED_URL_EXPIRY_TIME,
  NEXTAUTH_SECRET: value.NEXTAUTH_SECRET,
  NEXTAUTH_URL: value.NEXTAUTH_URL,
};

