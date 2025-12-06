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
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  S3_BUCKET_NAME: Joi.string().required(),
  S3_SIGNED_URL_EXPIRY_TIME: Joi.number().integer().positive().default(86400),
  NEXTAUTH_SECRET: Joi.string().required(),
  NEXTAUTH_URL: Joi.string().uri().optional(),
  VAULT_URL: Joi.string().required(),
  VAULT_SECRET_KEY: Joi.string().required(),
  UNISOUK_STORE_ID: Joi.string().required(),
  AMAZON_LWA_CLIENT_ID: Joi.string().required(),
  AMAZON_LWA_CLIENT_SECRET: Joi.string().required(),
  AMAZON_SP_API_URL: Joi.string().required(),
  AMAZON_MARKETPLACE_ID: Joi.string().required(),
}).unknown();

const { value, error } = envSchema
  .prefs({ abortEarly: false, convert: true })
  .validate(process.env);

if (error) {
  const details = error.details
    .map((detail) => `- ${detail.message}`)
    .join("\n");
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
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  S3_BUCKET_NAME: string;
  S3_SIGNED_URL_EXPIRY_TIME: number;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL?: string;
  VAULT_URL: string;
  VAULT_SECRET_KEY: string;
  UNISOUK_STORE_ID: string;
  AMAZON_LWA_CLIENT_ID: string;
  AMAZON_LWA_CLIENT_SECRET: string;
  AMAZON_SP_API_URL: string;
  AMAZON_MARKETPLACE_ID: string;
};

export const env: Env = {
  NODE_ENV: value.NODE_ENV,
  DATABASE_URL: value.DATABASE_URL,
  JWT_ACCESS_SECRET: value.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: value.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: value.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: value.JWT_REFRESH_EXPIRES_IN,
  AWS_REGION: value.AWS_REGION,
  AWS_ACCESS_KEY_ID: value.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: value.AWS_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME: value.S3_BUCKET_NAME,
  S3_SIGNED_URL_EXPIRY_TIME: value.S3_SIGNED_URL_EXPIRY_TIME,
  NEXTAUTH_SECRET: value.NEXTAUTH_SECRET,
  NEXTAUTH_URL: value.NEXTAUTH_URL,
  VAULT_URL: value.VAULT_URL,
  VAULT_SECRET_KEY: value.VAULT_SECRET_KEY,
  UNISOUK_STORE_ID: value.UNISOUK_STORE_ID,
  AMAZON_LWA_CLIENT_ID: value.AMAZON_LWA_CLIENT_ID,
  AMAZON_LWA_CLIENT_SECRET: value.AMAZON_LWA_CLIENT_SECRET,
  AMAZON_SP_API_URL: value.AMAZON_SP_API_URL,
  AMAZON_MARKETPLACE_ID: value.AMAZON_MARKETPLACE_ID,
};
