import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // NextAuth
    NEXTAUTH_URL: z.string().url().optional(),
    NEXTAUTH_SECRET: z.string().optional(),
    
    // JWT
    JWT_SECRET: z.string().optional(),
    
    // Google OAuth
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    
    // Google Cloud Storage - tornando opcionais temporariamente
    GOOGLE_CLOUD_PROJECT_ID_STORAGE: z.string().optional(),
    GOOGLE_CLOUD_CLIENT_EMAIL_STORAGE: z.string().optional(),
    GOOGLE_CLOUD_PRIVATE_KEY_STORAGE: z.string().optional(),
    GOOGLE_CLOUD_BUCKET_NAME_STORAGE: z.string().optional(),
    GOOGLE_CLOUD_RECOGNIZER_ID: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  },
  runtimeEnv: {
    // Client
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    
    // Server
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
    
    // Google OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    
    // Google Cloud Storage
    GOOGLE_CLOUD_PROJECT_ID_STORAGE: process.env.GOOGLE_CLOUD_PROJECT_ID_STORAGE,
    GOOGLE_CLOUD_CLIENT_EMAIL_STORAGE: process.env.GOOGLE_CLOUD_CLIENT_EMAIL_STORAGE,
    GOOGLE_CLOUD_PRIVATE_KEY_STORAGE: process.env.GOOGLE_CLOUD_PRIVATE_KEY_STORAGE,
    GOOGLE_CLOUD_BUCKET_NAME_STORAGE: process.env.GOOGLE_CLOUD_BUCKET_NAME_STORAGE,
    GOOGLE_CLOUD_RECOGNIZER_ID: process.env.GOOGLE_CLOUD_RECOGNIZER_ID,
  },
});
