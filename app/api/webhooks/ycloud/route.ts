import { NextResponse } from "next/server";
import { YCloudAdapter } from "@/src/lib/adapters/ycloud.adapter";
import { BotEngine } from "@/src/lib/engine/stateMachine";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "ycloud-webhook",
    message: "Webhook endpoint ready",
  });
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const incoming = YCloudAdapter.parseWebhook(body);

    if (
      !incoming ||
      incoming.type === "unknown" ||
      (!incoming.text && !incoming.buttonId && !incoming.listId)
    ) {
      return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
    }

    if (!incoming.text && (incoming.buttonId || incoming.listId)) {
      incoming.text = incoming.buttonId ?? incoming.listId ?? "";
    }

    const result = await BotEngine.processIncoming(incoming);

    return NextResponse.json(
      {
        ok: true,
        handled: Boolean(result),
        result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("POST /api/webhooks/ycloud", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unexpected webhook error",
      },
      { status: 200 },
    );
  }
}
