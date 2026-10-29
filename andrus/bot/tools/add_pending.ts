import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import {
  CATEGORIES,
  PERSONS,
  listPending,
  newId,
  savePending,
  type PendingItem,
} from "../lib/pending.js";

export default defineTool({
  description:
    "Add a pending payment, utility bill, school fee, medical appointment, health-plan task, medical order follow-up, card/loan payment, or other to-pay item.",
  effect: "write",
  inputSchema: z.object({
    title: z.string().min(1),
    category: z.enum(CATEGORIES),
    person: z.enum(PERSONS).optional(),
    amount: z.number().nonnegative().optional(),
    currency: z.string().default("COP"),
    dueDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Due or appointment date as YYYY-MM-DD"),
    status: z.enum(["pending", "scheduled"]).default("pending"),
    notes: z.string().optional(),
  }),
  async execute(input, ctx) {
    const now = new Date().toISOString();
    const item: PendingItem = {
      id: newId("pend"),
      title: input.title,
      category: input.category,
      person: input.person,
      amount: input.amount,
      currency: input.currency,
      dueDate: input.dueDate,
      status: input.status,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
    const items = await listPending(ctx);
    items.push(item);
    await savePending(ctx, items);
    return { ok: true as const, item };
  },
});
