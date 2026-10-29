import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { getWorkbookConfig } from "../lib/pending.js";

export default defineTool({
  description:
    "Get the configured Google workbook (account email, spreadsheet id/URL) for Andrea's shared Excel.",
  effect: "read",
  inputSchema: z.object({}),
  async execute(_input, ctx) {
    const config = await getWorkbookConfig(ctx);
    return {
      config,
      accessHint:
        "Google Drive/Sheets require Cursor account OAuth for andrea.gonzalez.torrente@gmail.com. Connect google-drive and google-sheets in Cursor, then paste the file link via set_workbook_config.",
    };
  },
});
