import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import {
  listMedicalOrders,
  newId,
  saveMedicalOrders,
  type MedicalOrder,
} from "../lib/pending.js";

export default defineTool({
  description:
    "Add a medical order (orden médica) issued for Andrea, Nicolás, or Sofía.",
  effect: "write",
  inputSchema: z.object({
    title: z.string().min(1),
    person: z.enum(["andrea", "nicolas", "sofia"]),
    issuedDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    expiresDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    provider: z.string().optional(),
    notes: z.string().optional(),
  }),
  async execute(input, ctx) {
    const now = new Date().toISOString();
    const order: MedicalOrder = {
      id: newId("ord"),
      title: input.title,
      person: input.person,
      issuedDate: input.issuedDate,
      expiresDate: input.expiresDate,
      provider: input.provider,
      status: "open",
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
    const items = await listMedicalOrders(ctx);
    items.push(order);
    await saveMedicalOrders(ctx, items);
    return { ok: true as const, order };
  },
});
