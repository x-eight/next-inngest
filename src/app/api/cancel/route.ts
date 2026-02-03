import { inngest } from "@/inngest/client";

/**
 * API Route to cancel an active Inngest workflow.
 * It sends a 'video/process.cancel' event which is captured 
 * by the 'video-workflow' cancelOn configuration.
 */
export async function POST(req: Request) {
    try {
        const { schemeId } = await req.json();
        
        await inngest.send({
            name: "video/process.cancel",
            data: { 
                scheme: { id: schemeId } 
            },
        });

        return Response.json({ ok: true, message: "Cancellation signal sent" });
    } catch (error) {
        return Response.json({ ok: false, error: "Failed to send cancellation signal" }, { status: 500 });
    }
}
