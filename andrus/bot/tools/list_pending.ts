import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { CATEGORIES, PERSONS, STATUSES, listPending } from "../lib/pending.js";

export default defineTool({
  description:
    "List pending-to-pay items across finances, utilities, schools, medical appointments, health plan, medical orders, cards, and loans. Filter by status, category, or person.",
  effect: "read",
  inputSchema: z.object({
    status: z.enum(STATUSES).optional(),
    category: z.enum(CATEGORIES).optional(),
    person: z.enum(PERSONS).optional(),
  }),
  async execute(input, ctx) {
    let items = await listPending(ctx);
    if (input.status) items = items.filter((i) => i.status === input.status);
    if (input.category)
      items = items.filter((i) => i.category === input.category);
    if (input.person) items = items.filter((i) => i.person === input.person);
    items = [...items].sort((a, b) => {
      const ad = a.dueDate ?? "9999-99-99";
      const bd = b.dueDate ?? "9999-99-99";
      return ad.localeCompare(bd);
    });
    return { count: items.length, items };
  },
});
