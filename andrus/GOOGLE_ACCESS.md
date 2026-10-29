# Google access for Andrus

Target Google account: **andrea.gonzalez.torrente@gmail.com**

## What happened with this account in this environment

| Check | Result |
| --- | --- |
| Email on file | Recorded as the expected owner of the Excel |
| Access with email only | **Blocked** — Google does not open Drive/Sheets from an address string |
| Agent SDK / Cursor login here | **Not signed in** — no API key or `agent-sdk login` session |
| Live `cursorAccount` MCP file | **Removed for now** — with `defineConnection({ cursorAccount: true })` present, `tool call` / `run` fail until Cursor is signed in |
| Google MCP on this Cloud Agent | **Not available** (Outlook connectors appear, still unauthenticated) |
| Password / OAuth token in chat | **None provided** — correctly not assumed |

**Conclusion:** Andrus is ready to *use* Google once Andrea completes OAuth; it cannot read her Excel yet.

## What Andrea must provide / do

1. Sign in to Cursor (and Agent SDK: `npx @grok/agent-sdk login`) as or linked to `andrea.gonzalez.torrente@gmail.com`.
2. Connect **Google Drive** and **Google Sheets** MCP in Cursor; finish Google OAuth as that Gmail.
3. Paste the Excel/Sheets **share link** or **spreadsheet id** (Viewer+ is enough to start).
4. Ask Andrus to run `set_workbook_config` with that link/id.
5. Enable the account MCP connection by creating `bot/mcp-connections/account.ts`:

```ts
import { defineConnection } from "@grok/agent-sdk/connections";

export default defineConnection({
  cursorAccount: true,
  servers: ["google-drive", "google-sheets"],
  advertiseTools: true,
  optional: true,
});
```

Do **not** send your Google password. Share only a link/id after OAuth.
