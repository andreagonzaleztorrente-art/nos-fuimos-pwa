import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import {
  listCreditCards,
  listLoans,
  listRecurringPayments,
  nextDueDateForDay,
  nextDueWindowEnd,
} from "../lib/pending.js";

export default defineTool({
  description:
    "List upcoming payment reminders for credit cards, loans, and recurring obligations (e.g. Nora Torrente 500.000 COP, days 1–5). Uses paymentDueDay when set; recurring items use their due-day window.",
  effect: "read",
  inputSchema: z.object({}),
  async execute(_input, ctx) {
    const cards = await listCreditCards(ctx);
    const loans = await listLoans(ctx);
    const recurring = await listRecurringPayments(ctx);
    const reminders: Array<{
      kind: "card" | "loan" | "recurring";
      id: string;
      label: string;
      bankOrRecipient: string;
      amount?: number;
      amountPendingFromExcel?: boolean;
      currency: string;
      dueDay?: number;
      dueWindow?: { start: number; end: number };
      nextDueDate?: string;
      needsDueDay: boolean;
      notes?: string;
    }> = [];

    for (const card of cards) {
      reminders.push({
        kind: "card",
        id: card.id,
        label: card.label,
        bankOrRecipient: card.bank,
        currency: card.currency,
        dueDay: card.paymentDueDay,
        nextDueDate: card.paymentDueDay
          ? nextDueDateForDay(card.paymentDueDay)
          : undefined,
        needsDueDay: card.paymentDueDay == null,
        notes: card.notes,
      });
    }
    for (const loan of loans) {
      reminders.push({
        kind: "loan",
        id: loan.id,
        label: loan.label,
        bankOrRecipient: loan.bank,
        currency: loan.currency,
        dueDay: loan.paymentDueDay,
        nextDueDate: loan.paymentDueDay
          ? nextDueDateForDay(loan.paymentDueDay)
          : undefined,
        needsDueDay: loan.paymentDueDay == null,
        notes: loan.notes,
      });
    }
    for (const item of recurring) {
      const hasWindow =
        item.dueDayStart != null && item.dueDayEnd != null;
      reminders.push({
        kind: "recurring",
        id: item.id,
        label: item.label,
        bankOrRecipient: item.recipient,
        amount: item.amount ?? undefined,
        amountPendingFromExcel: item.amountPendingFromExcel === true,
        currency: item.currency,
        dueWindow: hasWindow
          ? { start: item.dueDayStart!, end: item.dueDayEnd! }
          : undefined,
        nextDueDate: hasWindow
          ? nextDueWindowEnd(item.dueDayEnd!)
          : undefined,
        needsDueDay: !hasWindow,
        notes: item.notes,
      });
    }

    reminders.sort((a, b) =>
      (a.nextDueDate ?? "9999-99-99").localeCompare(
        b.nextDueDate ?? "9999-99-99",
      ),
    );
    return { count: reminders.length, reminders };
  },
});
