import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import {
  CATEGORIES,
  PERSONS,
  STATUSES,
  listPending,
  savePending,
} from "../lib/pending.js";

export default defineTool({
  description:
    "Update a pending item by id (status, amount, due date, notes, person, category). Use status paid or fulfilled when done.",
  effect: "write",
  inputSchema: z.object({
    id: z.string().min(1),
    title: z.string().min(1).optional(),
    category: z.enum(CATEGORIES).optional(),
    person: z.enum(PERSONS).optional(),
    amount: z.number().nonnegative().optional(),
    currency: z.string().optional(),
    dueDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    status: z.enum(STATUSES).optional(),
    notes: z.string().optional(),
  }),
  async execute(input, ctx) {
    const items = await listPending(ctx);
    const index = items.findIndex((i) => i.id === input.id);
    if (index < 0) {
      return { ok: false as const, error: "not_found", id: input.id };
    }
    const current = items[index]!;
    const updated = {
      ...current,
      title: input.title ?? current.title,
      category: input.category ?? current.category,
      person: input.person ?? current.person,
      amount: input.amount ?? current.amount,
      currency: input.currency ?? current.currency,
      dueDate: input.dueDate ?? current.dueDate,
      status: input.status ?? current.status,
      notes: input.notes ?? current.notes,
      updatedAt: new Date().toISOString(),
    };
    items[index] = updated;
    await savePending(ctx, items);
    return { ok: true as const, item: updated };
  },
});
