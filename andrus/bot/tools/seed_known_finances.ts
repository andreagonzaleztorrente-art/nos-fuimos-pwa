import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import {
  knownFinanceSeed,
  listBankAccounts,
  listCreditCards,
  listLoans,
  listRecurringPayments,
  saveBankAccounts,
  saveCreditCards,
  saveLoans,
  saveRecurringPayments,
} from "../lib/pending.js";

export default defineTool({
  description:
    "Load Andrea's known banks, cards, loans, and recurring payments (Bancolombia ahorros, Neki, tarjeta Bancolombia, préstamo Hero, crédito hipotecario, Nora Torrente 500000 COP days 1-5, New Cambridge transport amount pending from Excel). Merges by id; set replace=true to overwrite.",
  effect: "idempotent",
  inputSchema: z.object({
    replace: z
      .boolean()
      .default(false)
      .describe("If true, replace all finance lists with the seed."),
  }),
  async execute({ replace }, ctx) {
    const seed = knownFinanceSeed();
    if (replace) {
      await saveBankAccounts(ctx, seed.accounts);
      await saveCreditCards(ctx, seed.cards);
      await saveLoans(ctx, seed.loans);
      await saveRecurringPayments(ctx, seed.recurring);
      return {
        ok: true as const,
        mode: "replace" as const,
        accounts: seed.accounts.length,
        cards: seed.cards.length,
        loans: seed.loans.length,
        recurring: seed.recurring.length,
      };
    }

    const mergeById = <T extends { id: string }>(
      existing: T[],
      incoming: T[],
    ): T[] => {
      const map = new Map(existing.map((i) => [i.id, i]));
      for (const item of incoming) {
        if (!map.has(item.id)) map.set(item.id, item);
      }
      return [...map.values()];
    };

    const accounts = mergeById(await listBankAccounts(ctx), seed.accounts);
    const cards = mergeById(await listCreditCards(ctx), seed.cards);
    const loans = mergeById(await listLoans(ctx), seed.loans);
    const recurring = mergeById(
      await listRecurringPayments(ctx),
      seed.recurring,
    );
    await saveBankAccounts(ctx, accounts);
    await saveCreditCards(ctx, cards);
    await saveLoans(ctx, loans);
    await saveRecurringPayments(ctx, recurring);
    return {
      ok: true as const,
      mode: "merge" as const,
      accounts: accounts.length,
      cards: cards.length,
      loans: loans.length,
      recurring: recurring.length,
      seeded: {
        accounts: seed.accounts.map((a) => `${a.bank}: ${a.label}`),
        cards: seed.cards.map((c) => `${c.bank}: ${c.label}`),
        loans: seed.loans.map((l) => `${l.bank}: ${l.label}`),
        recurring: seed.recurring.map((r) => ({
          recipient: r.recipient,
          amount: r.amount,
          amountPendingFromExcel: r.amountPendingFromExcel === true,
          dueWindow:
            r.dueDayStart != null && r.dueDayEnd != null
              ? { start: r.dueDayStart, end: r.dueDayEnd }
              : null,
        })),
      },
    };
  },
});
