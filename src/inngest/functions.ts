import { inngest } from "./client";
import { AICloudService, StorageService } from "./services/mock-services";

/**
 * A simplified background workflow that simulates 
 * a multi-step video processing pipeline.
 */
export const videoWorkflow = inngest.createFunction(
  { 
    id: "video-workflow", 
    name: "Video AI Workflow",
    cancelOn: [
      { 
        event: "video/process.cancel", 
        if: "async.data.scheme.id == event.data.scheme.id" 
      }
    ]
  },
  { event: "video/process" },
  async ({ event, step }) => {
    const { scheme } = event.data;

    // Step 1: Analyze Video requirements
    const analysis = await step.run("AI Analysis", async () => {
      return await AICloudService.processVideo(scheme.description || "Default processing");
    });

    // Step 2: Generate Audio Assets
    const audio = await step.run("Audio Synthesis", async () => {
      return await AICloudService.processAudio(scheme.title || "Demo Audio");
    });

    // Step 3: Final Cloud Archive
    const finalUrl = await step.run("Cloud Storage Archive", async () => {
      return await StorageService.upload("processed_video.mp4", { video: analysis.url, audio: audio.audioUrl });
    });

    return {
      success: true,
      resultUrl: finalUrl
    };
  }
);

/**
 * A simple number processing pipeline for demonstrations.
 */
export const mathWorkflow = inngest.createFunction(
  { id: "math-workflow", name: "Math Processing" },
  { event: "number/start" },
  async ({ event, step }) => {
    const startValue = event.data.num_start || 0;

    const result = await step.run("Complex Calculation", async () => {
      await new Promise((r) => setTimeout(r, 2000));
      return startValue * 42;
    });

    return { result };
  }
);