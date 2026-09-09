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

function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  return digits ? `+${digits}` : "";
}

export class YCloudAdapter {
  private readonly apiKey: string;
  private readonly fromNumber: string;

  constructor(apiKey?: string, fromNumber?: string) {
    this.apiKey = apiKey || process.env.YCLOUD_API_KEY || "";
    const rawFrom = fromNumber || process.env.YCLOUD_WHATSAPP_FROM || "";
    this.fromNumber = rawFrom
      ? rawFrom.startsWith("+")
        ? rawFrom
        : `+${rawFrom.replace(/[^\d]/g, "")}`
      : "";

    if (!this.apiKey) {
      throw new Error("Missing YCloud API key for tenant");
    }
    if (!this.fromNumber) {
      throw new Error("Missing YCloud WhatsApp From number for tenant");
    }
  }

  private async request(path: string, body: Record<string, unknown>) {
    const response = await fetch(`${YCLOUD_API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`YCloud API error (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<Record<string, unknown>>;
  }

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

  async sendText(to: string, text: string) {
    return this.request("/whatsapp/messages", {
      from: this.fromNumber,
      to: normalizePhone(to),
      type: "text",
      text: { body: text },
    });
  }

  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    bodyParameters: string[] = [],
  ) {
    const template: Record<string, unknown> = {
      name: templateName,
      language: { code: languageCode },
    };

    if (bodyParameters.length > 0) {
      template.components = [
        {
          type: "body",
          parameters: bodyParameters.map((text) => ({
            type: "text",
            text,
          })),
        },
      ];
    }

    return this.request("/whatsapp/messages", {
      from: this.fromNumber,
      to: normalizePhone(to),
      type: "template",
      template,
    });
  }

  async sendButtons(to: string, bodyText: string, buttons: YCloudButton[]) {
    return this.request("/whatsapp/messages", {
      from: this.fromNumber,
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

  async sendList(
    to: string,
    bodyText: string,
    buttonText: string,
    sections: YCloudListSection[],
  ) {
    return this.request("/whatsapp/messages", {
      from: this.fromNumber,
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

  /** Backward-compatible static helpers using process.env */
  static async sendText(to: string, text: string) {
    return new YCloudAdapter().sendText(to, text);
  }

  static async sendButtons(
    to: string,
    bodyText: string,
    buttons: YCloudButton[],
  ) {
    return new YCloudAdapter().sendButtons(to, bodyText, buttons);
  }

  static async sendList(
    to: string,
    bodyText: string,
    buttonText: string,
    sections: YCloudListSection[],
  ) {
    return new YCloudAdapter().sendList(to, bodyText, buttonText, sections);
  }
}
