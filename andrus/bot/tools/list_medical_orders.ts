import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { listMedicalOrders } from "../lib/pending.js";

export default defineTool({
  description:
    "List medical orders (órdenes médicas) for Andrea, Nicolás, and/or Sofía.",
  effect: "read",
  inputSchema: z.object({
    person: z.enum(["andrea", "nicolas", "sofia"]).optional(),
    status: z
      .enum(["open", "scheduled", "fulfilled", "expired", "cancelled"])
      .optional(),
  }),
  async execute(input, ctx) {
    let items = await listMedicalOrders(ctx);
    if (input.person) items = items.filter((i) => i.person === input.person);
    if (input.status) items = items.filter((i) => i.status === input.status);
    return { count: items.length, orders: items };
  },
});
