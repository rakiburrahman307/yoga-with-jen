import dotenv from 'dotenv';
import { hostname } from 'os';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  ip_address: process.env.IP_ADDRESS,
  reset_pass_expire_time: process.env.RESET_TOKEN_EXPIRE_TIME,
  database_url: process.env.DATABASE_URL,
  frontend_url: process.env.FRONTEND_URL,
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  stripe_secret_key: process.env.STRIPE_SECRET_KYE,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  socket_port: process.env.SOCKET_PORT,
  allowed_origins: process.env.ALLOWED_ORIGINS,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    jwt_expire_in: process.env.JWT_EXPIRE_IN,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    jwt_refresh_expire_in: process.env.JWT_REFRESH_EXPIRE_IN,
  },
  aws: {
    aws_bucket_name: process.env.AWS_BUCKET_NAME,
    aws_region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  },
  bunnyCDN: {
    apiKey: process.env.BUNNY_CDN_API_KEY,
    storageZone: process.env.BUNNY_CDN_STORAGE_ZONE,
    hostname: process.env.BUNNY_CDN_STORAGE_HOST_NAME,
    region: process.env.BUNNY_CDN_STORAGE_ZONE_REGION,
    pullZoneUrl: process.env.BUNNY_PULL_ZONE_URL,
  },
  email: {
    from: process.env.EMAIL_FROM,
    user: process.env.EMAIL_USER,
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_HOST,
    pass: process.env.EMAIL_PASS,
  },
  express_sessoin: process.env.EXPRESS_SESSION_SECRET_KEY,
  social: {
    google_client_id: process.env.GOOGLE_CLIENT_ID,
    facebook_client_id: process.env.FACEBOOK_CLIENT_ID,
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
    facebook_client_secret: process.env.FACEBOOK_CLIENT_SECRET,
    callback_url: process.env.GOOGLE_CALLBACK_URL,
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },
  stripe: {
    stripe_secret_key: process.env.STRIPE_SECRET_KYE,
    paymentSuccess_url: process.env.FRONTEND_URL,
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    stripe_webhook_url: process.env.STRIPE_WEBHOOK_URL,
    stripe_product_id: process.env.STRIPE_PRODUCT_ID,
  },
  super_admin: {
    email: process.env.SUPER_ADMIN_EMAIL,
    password: process.env.SUPER_ADMIN_PASSWORD,
  },
};
