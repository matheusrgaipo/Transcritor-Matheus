import { SpeechClient } from "@google-cloud/speech";

export function createSpeechClient() {
  return new SpeechClient({
    credentials: {
      client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL_STORAGE,
      private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY_STORAGE?.replace(/\\n/g, "\n"),
    },
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID_STORAGE,
  });
}