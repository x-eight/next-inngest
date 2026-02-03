import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { videoWorkflow, mathWorkflow } from "@/inngest/functions";
import { config } from "../config";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [videoWorkflow, mathWorkflow],
  signingKey: config.inngest.signingKey
});