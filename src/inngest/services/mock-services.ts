/**
 * Consolidated Mock Services for Demo Purposes.
 * These simulate long-running tasks without requiring external API keys or binaries.
 */

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const AICloudService = {
  /**
   * Simulates AI video analysis or generation.
   */
  async processVideo(prompt: string) {
    console.log(`[MOCK] Processing video with prompt: ${prompt}`);
    await sleep(4000);
    return {
      status: "success",
      url: "https://demo.example.com/result_video.mp4",
      metadata: { duration: 15.5, size: "24MB" }
    };
  },

  /**
   * Simulates transcription or TTS services.
   */
  async processAudio(text: string) {
    console.log(`[MOCK] Processing audio for text length: ${text.length}`);
    await sleep(3000);
    return {
      status: "success",
      audioUrl: "https://demo.example.com/result_audio.mp3"
    };
  }
};

export const StorageService = {
  /**
   * Simulates uploading data to R2 or Google Cloud Storage.
   */
  async upload(fileName: string, data: any) {
    console.log(`[MOCK] Uploading ${fileName} to storage...`);
    await sleep(2000);
    return `https://storage.demo.com/${fileName}`;
  }
};
