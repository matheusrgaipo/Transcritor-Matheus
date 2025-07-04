import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Google Cloud Storage
    GOOGLE_CLOUD_PROJECT_ID_STORAGE: z.string(),
    GOOGLE_CLOUD_CLIENT_EMAIL_STORAGE: z.string(),
    GOOGLE_CLOUD_PRIVATE_KEY_STORAGE: z.string(),
    GOOGLE_CLOUD_BUCKET_NAME_STORAGE: z.string(),

  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    // Google Cloud Storage
    GOOGLE_CLOUD_PROJECT_ID_STORAGE: process.env.GOOGLE_CLOUD_PROJECT_ID_STORAGE,
    GOOGLE_CLOUD_CLIENT_EMAIL_STORAGE: process.env.GOOGLE_CLOUD_CLIENT_EMAIL_STORAGE,
    GOOGLE_CLOUD_PRIVATE_KEY_STORAGE: process.env.GOOGLE_CLOUD_PRIVATE_KEY_STORAGE,
    GOOGLE_CLOUD_BUCKET_NAME_STORAGE: process.env.GOOGLE_CLOUD_BUCKET_NAME_STORAGE,
  },
});
