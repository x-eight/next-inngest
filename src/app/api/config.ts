import dotenv from "dotenv";

dotenv.config();

export const config = {
  inngest: {
    signingKey: process.env.INNGEST_SIGNING_KEY as string,
    eventKey: process.env.INNGEST_EVENT_KEY as string,
  },
  google: {
    bucket: process.env.GOOGLE_BUCKET as string,
    serviceAccount: process.env.GOOGLE_SERVICE_ACCOUNT_B64 as string,
  },
  freepik: {
    url: process.env.FREEPIK_API_BASE_URL || "https://api.freepik.com/v1/ai",
    key: process.env.FREEPICK_API_KEY as string,
    nanoModel:
      process.env.FREEPICK_NANO_MODEL || "gemini-2-5-flash-image-preview",
  },
  gemini: {
    key: process.env.GEMINI_GENERATIVE_AI_API_KEY as string,
    nanoModel:
      process.env.GEMINI_NANO_MODEL || "gemini-2-5-flash-image-preview",
    imageModel:
      process.env.GEMINI_IMAGE_MODEL || "imagen-4.0-generate-preview-06-06",
  },
  hailuo: {
    //model: process.env.HAILUO_MODEL || "minimax-hailuo-02-1080p"
    model: process.env.HAILUO_MODEL || "minimax-hailuo-02-768p",
  },
  pixVerse: {
    resolution: process.env.PIXVERSE_RESOLUTION || "720p",
  },
  elevenLabs: {
    url: process.env.ELEVENLABS_URL || "https://api.elevenlabs.io",
    key: process.env.ELEVENLABS_API_KEY as string,
    model: process.env.ELEVENLABS_MODEL || "eleven_multilingual_sts_v2",
  },
  deepgram: {
    url: process.env.DEEPGRAM_URL || "https://api.deepgram.com/v1",
    model: process.env.DEEPGRAM_MODEL || "nova-2",
    key: process.env.DEEPGRAM_API_KEY as string,
  },
  r2: {
    bucket: process.env.R2_BUCKET_NAME as string,
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
    accountId: process.env.R2_ACCOUNT_ID as string,
  },
};
