import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import {
  DEFAULT_GOOGLE_EMAIL,
  getWorkbookConfig,
  saveWorkbookConfig,
} from "../lib/pending.js";

export default defineTool({
  description:
    "Save the Google Sheets/Drive link or spreadsheet id for Andrea's shared Excel (account andrea.gonzalez.torrente@gmail.com).",
  effect: "write",
  inputSchema: z.object({
    spreadsheetUrl: z.string().url().optional(),
    spreadsheetId: z.string().min(1).optional(),
    fileName: z.string().optional(),
    notes: z.string().optional(),
  }),
  async execute(input, ctx) {
    if (!input.spreadsheetUrl && !input.spreadsheetId) {
      return {
        ok: false as const,
        error: "need_spreadsheet_url_or_id",
      };
    }
    let spreadsheetId = input.spreadsheetId;
    if (!spreadsheetId && input.spreadsheetUrl) {
      const match = input.spreadsheetUrl.match(/\/(?:d|file\/d)\/([a-zA-Z0-9-_]+)/);
      if (match) spreadsheetId = match[1];
    }
    const prior = await getWorkbookConfig(ctx);
    const config = {
      googleAccountEmail: DEFAULT_GOOGLE_EMAIL,
      spreadsheetId: spreadsheetId ?? prior.spreadsheetId,
      spreadsheetUrl: input.spreadsheetUrl ?? prior.spreadsheetUrl,
      fileName: input.fileName ?? prior.fileName,
      notes: input.notes ?? prior.notes,
      updatedAt: new Date().toISOString(),
    };
    await saveWorkbookConfig(ctx, config);
    return { ok: true as const, config };
  },
});
