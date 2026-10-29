import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { listMedicalOrders, saveMedicalOrders } from "../lib/pending.js";

export default defineTool({
  description:
    "Update a medical order by id (status, dates, notes). Mark fulfilled when completed.",
  effect: "write",
  inputSchema: z.object({
    id: z.string().min(1),
    title: z.string().min(1).optional(),
    person: z.enum(["andrea", "nicolas", "sofia"]).optional(),
    issuedDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    expiresDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    provider: z.string().optional(),
    status: z
      .enum(["open", "scheduled", "fulfilled", "expired", "cancelled"])
      .optional(),
    notes: z.string().optional(),
  }),
  async execute(input, ctx) {
    const items = await listMedicalOrders(ctx);
    const index = items.findIndex((i) => i.id === input.id);
    if (index < 0) {
      return { ok: false as const, error: "not_found", id: input.id };
    }
    const current = items[index]!;
    const updated = {
      ...current,
      title: input.title ?? current.title,
      person: input.person ?? current.person,
      issuedDate: input.issuedDate ?? current.issuedDate,
      expiresDate: input.expiresDate ?? current.expiresDate,
      provider: input.provider ?? current.provider,
      status: input.status ?? current.status,
      notes: input.notes ?? current.notes,
      updatedAt: new Date().toISOString(),
    };
    items[index] = updated;
    await saveMedicalOrders(ctx, items);
    return { ok: true as const, order: updated };
  },
});
