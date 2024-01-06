import { pusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
    const channelName = "trash-channel";
    const eventName = "trash-classified";

  const resultPayload: ResultPayload = await req.json();

  pusherServer.trigger(channelName, eventName, resultPayload)

  return new Response(JSON.stringify({ success: true }))
}