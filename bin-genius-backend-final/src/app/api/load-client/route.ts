import { pusherServer } from "@/lib/pusher";

export async function POST() {
    const channelName = "trash-channel";
    const eventName = "trash-loading";

  pusherServer.trigger(channelName, eventName, {})

  return new Response(JSON.stringify({ success: true }))
}