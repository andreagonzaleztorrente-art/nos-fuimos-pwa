import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import {
  listBankAccounts,
  listCreditCards,
  listLoans,
  listRecurringPayments,
  type BankAccount,
  type CreditCard,
  type Loan,
  type RecurringPayment,
} from "../lib/pending.js";

export default defineTool({
  description:
    "List Andrea's banks/accounts, credit cards, loans (including hipotecario and Hero), and recurring payments (Nora Torrente, New Cambridge).",
  effect: "read",
  inputSchema: z.object({
    include: z
      .array(z.enum(["accounts", "cards", "loans", "recurring"]))
      .default(["accounts", "cards", "loans", "recurring"]),
  }),
  async execute({ include }, ctx) {
    const accounts: BankAccount[] = include.includes("accounts")
      ? await listBankAccounts(ctx)
      : [];
    const cards: CreditCard[] = include.includes("cards")
      ? await listCreditCards(ctx)
      : [];
    const loans: Loan[] = include.includes("loans")
      ? await listLoans(ctx)
      : [];
    const recurring: RecurringPayment[] = include.includes("recurring")
      ? await listRecurringPayments(ctx)
      : [];
    return { accounts, cards, loans, recurring };
  },
});
