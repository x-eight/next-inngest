import { inngest } from "@/inngest/client";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const schemeId: string = body.schemeId || `scheme_${Date.now()}`;

  await inngest.send({
    name: "video/process",
    data: {
      scheme: {
        id: schemeId,
        title: "The Journey to Your Dream Life",
        description:
          "This video inspires viewers to persevere through challenges to achieve their dreams.",
        tags: ["motivation", "inspiration", "dreams", "perseverance"],
        voiceId: "B31Kx7rXmNnYqp1QWHR2",
        resolution: "low",
        aspectRatio: "9:16",
        style: "pixar",
        segments: [
          {
            title: "Don't Stop Now",
            text: "The version of you you’re becoming deserves this effort.",
            description:
              "This segment encourages viewers to continue their efforts, reinforcing the idea that their future self is worth the struggle.",
            clipsConfig: {
              imagePrompt:
                "An image of a person standing at a crossroads, looking determined and ready to choose the path of persistence and effort.",
              videoPrompt:
                "A motivating scene of a person running towards a finish line, with encouraging crowds cheering them on, symbolizing support and determination.",
            },
            continuity: "new_scene",
            id: "seg_1761269182817_zf89w65",
          },
          {
            title: "You're Closer Than You Think",
            text: "Keep pushing. You’re closer than you think.",
            description:
              "This closing segment serves as a final push for viewers to maintain their momentum and believe in their progress.",
            clipsConfig: {
              imagePrompt:
                "A powerful image of a person at the edge of a cliff, looking out at a vast landscape, symbolizing the idea of being on the brink of success.",
              videoPrompt:
                "A dynamic clip showing a runner nearing the finish line, with the energy building and a cheering crowd in the background, emphasizing the thrill of nearing success.",
            },
            continuity: "new_scene",
            id: "seg_1761269182817_cfwe93i",
          },
        ],
      },
    },
  });

  return Response.json({ ok: true });
}
