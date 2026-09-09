import type {
  StandardMessage,
  YCloudButton,
  YCloudListSection,
} from "@/src/types/funnel";

const YCLOUD_API_BASE = "https://api.ycloud.com/v2";

type YCloudIncomingMessage = {
  from?: string;
  to?: string;
  timestamp?: number | string;
  type?: string;
  text?: { body?: string };
  button?: { payload?: string; text?: string };
  interactive?: {
    type?: string;
    button_reply?: { id?: string; title?: string };
    list_reply?: { id?: string; title?: string };
  };
};

type YCloudWebhookBody = {
  id?: string;
  type?: string;
  whatsappMessage?: YCloudIncomingMessage;
  data?: YCloudIncomingMessage;
};

function getApiKey(): string {
  const key = process.env.YCLOUD_API_KEY;
  if (!key) {
    throw new Error("Missing YCLOUD_API_KEY");
  }
  return key;
}

async function ycloudFetch(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${YCLOUD_API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": getApiKey(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`YCloud API error (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export class YCloudAdapter {
  static parseWebhook(body: unknown): StandardMessage | null {
    const payload = body as YCloudWebhookBody;
    const message = payload.whatsappMessage ?? payload.data;

    if (!message?.from) {
      return null;
    }

    const from = normalizePhone(message.from);
    const to = message.to ? normalizePhone(message.to) : undefined;
    const timestamp = String(
      message.timestamp ?? payload.id ?? new Date().toISOString(),
    );

    if (message.type === "text" && message.text?.body) {
      return {
        from,
        to,
        text: message.text.body.trim(),
        type: "text",
        timestamp,
        raw: payload as Record<string, unknown>,
      };
    }

    if (message.interactive?.button_reply) {
      const reply = message.interactive.button_reply;
      return {
        from,
        to,
        text: reply.title ?? reply.id ?? "",
        type: "interactive_button",
        buttonId: reply.id,
        timestamp,
        raw: payload as Record<string, unknown>,
      };
    }

    if (message.interactive?.list_reply) {
      const reply = message.interactive.list_reply;
      return {
        from,
        to,
        text: reply.title ?? reply.id ?? "",
        type: "interactive_list",
        listId: reply.id,
        timestamp,
        raw: payload as Record<string, unknown>,
      };
    }

    if (message.button?.payload || message.button?.text) {
      return {
        from,
        to,
        text: message.button.text ?? message.button.payload ?? "",
        type: "interactive_button",
        buttonId: message.button.payload,
        timestamp,
        raw: payload as Record<string, unknown>,
      };
    }

    return {
      from,
      to,
      text: "",
      type: "unknown",
      timestamp,
      raw: payload as Record<string, unknown>,
    };
  }

  static async sendText(to: string, text: string) {
    return ycloudFetch("/whatsapp/messages", {
      from: process.env.YCLOUD_WHATSAPP_FROM,
      to: normalizePhone(to),
      type: "text",
      text: { body: text },
    });
  }

  static async sendButtons(to: string, bodyText: string, buttons: YCloudButton[]) {
    return ycloudFetch("/whatsapp/messages", {
      from: process.env.YCLOUD_WHATSAPP_FROM,
      to: normalizePhone(to),
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: bodyText },
        action: {
          buttons: buttons.slice(0, 3).map((button) => ({
            type: "reply",
            reply: {
              id: button.id,
              title: button.title.slice(0, 20),
            },
          })),
        },
      },
    });
  }

  static async sendList(
    to: string,
    bodyText: string,
    buttonText: string,
    sections: YCloudListSection[],
  ) {
    return ycloudFetch("/whatsapp/messages", {
      from: process.env.YCLOUD_WHATSAPP_FROM,
      to: normalizePhone(to),
      type: "interactive",
      interactive: {
        type: "list",
        body: { text: bodyText },
        action: {
          button: buttonText.slice(0, 20),
          sections: sections.map((section) => ({
            title: section.title.slice(0, 24),
            rows: section.rows.map((row) => ({
              id: row.id,
              title: row.title.slice(0, 24),
              description: row.description?.slice(0, 72),
            })),
          })),
        },
      },
    });
  }
}
