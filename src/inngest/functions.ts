import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { AICloudService, StorageService } from "./services/mock-services";

// Channel helper — one channel per workflow run, scoped by schemeId
export const workflowChannel = (schemeId: string) => `workflow:${schemeId}`;

/**
 * A simplified background workflow that simulates
 * a multi-step video processing pipeline.
 *
 * Uses Inngest Realtime to publish step start/end events so the
 * frontend can show live notifications via useInngestSubscription.
 */
export const videoWorkflow = inngest.createFunction(
  {
    id: "video-workflow",
    name: "Video AI Workflow",
    cancelOn: [
      {
        event: "video/process.cancel",
        if: "async.data.scheme.id == event.data.scheme.id",
      },
    ],
  },
  { event: "video/process" },
  async ({ event, step, publish }) => {
    const { scheme } = event.data;
    const channel = workflowChannel(scheme.id);

    try {
      // ── Step 1 ──────────────────────────────────────────────────────────────
      await publish({
        channel,
        topic: "steps",
        data: { type: "step_start", step: "AI Analysis", stepIndex: 1 },
      });
      // throw new Error("AI Analysis failed");
      const analysis = await step.run("AI Analysis", async () => {
        return await AICloudService.processVideo(
          scheme.description || "Default processing"
        );
      });

      await publish({
        channel,
        topic: "steps",
        data: {
          type: "step_end",
          step: "AI Analysis",
          stepIndex: 1,
          result: analysis,
        },
      });

      if (/error|fail/i.test(scheme.id)) {
        throw new Error("AI Analysis failed");
      }

      // ── Step 2 ──────────────────────────────────────────────────────────────
      await publish({
        channel,
        topic: "steps",
        data: { type: "step_start", step: "Audio Synthesis", stepIndex: 2 },
      });

      const audio = await step.run("Audio Synthesis", async () => {
        return await AICloudService.processAudio(scheme.title || "Demo Audio");
      });

      await publish({
        channel,
        topic: "steps",
        data: {
          type: "step_end",
          step: "Audio Synthesis",
          stepIndex: 2,
          result: audio,
        },
      });

      // ── Step 3 ──────────────────────────────────────────────────────────────
      await publish({
        channel,
        topic: "steps",
        data: {
          type: "step_start",
          step: "Cloud Storage Archive",
          stepIndex: 3,
        },
      });

      const finalUrl = await step.run("Cloud Storage Archive", async () => {
        return await StorageService.upload("processed_video.mp4", {
          video: analysis.url,
          audio: audio.audioUrl,
        });
      });

      await publish({
        channel,
        topic: "steps",
        data: {
          type: "step_end",
          step: "Cloud Storage Archive",
          stepIndex: 3,
          result: { url: finalUrl },
        },
      });

      // ── Complete ─────────────────────────────────────────────────────────────
      await publish({
        channel,
        topic: "steps",
        data: {
          type: "function_complete",
          resultUrl: finalUrl,
          message: "Workflow completed successfully!",
        },
      });

      return { success: true, resultUrl: finalUrl };
    } catch (err: unknown) {
      // ── Error ────────────────────────────────────────────────────────────────
      const message = err instanceof Error ? err.message : "Unknown error";
      await publish({
        channel,
        topic: "steps",
        data: {
          type: "function_error",
          error: message,
          message: `Workflow failed: ${message}`,
        },
      });
      // throw err; // re-throw so Inngest marks the run as failed
      throw new NonRetriableError("Workflow failed", { cause: err });
    }
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