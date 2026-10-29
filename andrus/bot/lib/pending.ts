import type { ToolContext } from "@grok/agent-sdk/tools";

export const CATEGORIES = [
  "finanzas",
  "pagos",
  "recibos_publicos",
  "colegios",
  "citas_medicas",
  "plan_salud",
  "ordenes_medicas",
  "tarjetas_credito",
  "cuentas_bancarias",
  "prestamos",
  "apoyo_familiar",
  "otro",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const PERSONS = ["andrea", "nicolas", "sofia", "familia"] as const;
export type Person = (typeof PERSONS)[number];

export const STATUSES = [
  "pending",
  "paid",
  "cancelled",
  "scheduled",
  "fulfilled",
  "expired",
] as const;
export type Status = (typeof STATUSES)[number];

export type PendingItem = {
  id: string;
  title: string;
  category: Category;
  person?: Person;
  amount?: number;
  currency?: string;
  dueDate?: string;
  status: Status;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type MedicalOrder = {
  id: string;
  title: string;
  person: "andrea" | "nicolas" | "sofia";
  issuedDate?: string;
  expiresDate?: string;
  provider?: string;
  status: "open" | "scheduled" | "fulfilled" | "expired" | "cancelled";
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type BankAccount = {
  id: string;
  bank: string;
  label: string;
  type: "checking" | "savings" | "other";
  lastFour?: string;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreditCard = {
  id: string;
  bank: string;
  label: string;
  lastFour?: string;
  paymentDueDay?: number;
  cutoffDay?: number;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Loan = {
  id: string;
  bank: string;
  label: string;
  kind: "personal" | "mortgage" | "other";
  paymentDueDay?: number;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

/** Recurring monthly obligation (family support, fixed transfers, etc.). */
export type RecurringPayment = {
  id: string;
  recipient: string;
  label: string;
  /** Omit or null when the amount must come from the shared Excel. */
  amount?: number | null;
  amountPendingFromExcel?: boolean;
  currency: string;
  /** Inclusive day-of-month window start (1–31). Optional when unknown. */
  dueDayStart?: number;
  /** Inclusive day-of-month window end (1–31). Optional when unknown. */
  dueDayEnd?: number;
  category: Category;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkbookConfig = {
  googleAccountEmail: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  fileName?: string;
  notes?: string;
  updatedAt: string;
};

const PENDING_KEY = "andrus:pending";
const ORDERS_KEY = "andrus:medical_orders";
const ACCOUNTS_KEY = "andrus:bank_accounts";
const CARDS_KEY = "andrus:credit_cards";
const LOANS_KEY = "andrus:loans";
const RECURRING_KEY = "andrus:recurring_payments";
const WORKBOOK_KEY = "andrus:workbook";
export const DEFAULT_GOOGLE_EMAIL = "andrea.gonzalez.torrente@gmail.com";

export async function listPending(ctx: ToolContext): Promise<PendingItem[]> {
  const value = await ctx.host.kv.get(PENDING_KEY);
  if (!Array.isArray(value)) return [];
  return value as PendingItem[];
}

export async function savePending(
  ctx: ToolContext,
  items: PendingItem[],
): Promise<void> {
  await ctx.host.kv.put(PENDING_KEY, items);
}

export async function listMedicalOrders(
  ctx: ToolContext,
): Promise<MedicalOrder[]> {
  const value = await ctx.host.kv.get(ORDERS_KEY);
  if (!Array.isArray(value)) return [];
  return value as MedicalOrder[];
}

export async function saveMedicalOrders(
  ctx: ToolContext,
  items: MedicalOrder[],
): Promise<void> {
  await ctx.host.kv.put(ORDERS_KEY, items);
}

export async function listBankAccounts(
  ctx: ToolContext,
): Promise<BankAccount[]> {
  const value = await ctx.host.kv.get(ACCOUNTS_KEY);
  if (!Array.isArray(value)) return [];
  return value as BankAccount[];
}

export async function saveBankAccounts(
  ctx: ToolContext,
  items: BankAccount[],
): Promise<void> {
  await ctx.host.kv.put(ACCOUNTS_KEY, items);
}

export async function listCreditCards(ctx: ToolContext): Promise<CreditCard[]> {
  const value = await ctx.host.kv.get(CARDS_KEY);
  if (!Array.isArray(value)) return [];
  return value as CreditCard[];
}

export async function saveCreditCards(
  ctx: ToolContext,
  items: CreditCard[],
): Promise<void> {
  await ctx.host.kv.put(CARDS_KEY, items);
}

export async function listLoans(ctx: ToolContext): Promise<Loan[]> {
  const value = await ctx.host.kv.get(LOANS_KEY);
  if (!Array.isArray(value)) return [];
  return value as Loan[];
}

export async function saveLoans(ctx: ToolContext, items: Loan[]): Promise<void> {
  await ctx.host.kv.put(LOANS_KEY, items);
}

export async function listRecurringPayments(
  ctx: ToolContext,
): Promise<RecurringPayment[]> {
  const value = await ctx.host.kv.get(RECURRING_KEY);
  if (!Array.isArray(value)) return [];
  return value as RecurringPayment[];
}

export async function saveRecurringPayments(
  ctx: ToolContext,
  items: RecurringPayment[],
): Promise<void> {
  await ctx.host.kv.put(RECURRING_KEY, items);
}

export async function getWorkbookConfig(
  ctx: ToolContext,
): Promise<WorkbookConfig> {
  const value = await ctx.host.kv.get(WORKBOOK_KEY);
  if (value && typeof value === "object") {
    return value as WorkbookConfig;
  }
  return {
    googleAccountEmail: DEFAULT_GOOGLE_EMAIL,
    updatedAt: new Date().toISOString(),
  };
}

export async function saveWorkbookConfig(
  ctx: ToolContext,
  config: WorkbookConfig,
): Promise<void> {
  await ctx.host.kv.put(WORKBOOK_KEY, config);
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

/** Next calendar date for a day-of-month payment due (1–31). */
export function nextDueDateForDay(
  dayOfMonth: number,
  from = new Date(),
): string {
  const y = from.getUTCFullYear();
  const m = from.getUTCMonth();
  const dim = (year: number, month: number) =>
    new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const clamp = (year: number, month: number, day: number) =>
    Math.min(day, dim(year, month));

  let year = y;
  let month = m;
  const today = from.getUTCDate();
  if (today >= clamp(year, month, dayOfMonth)) {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }
  const day = clamp(year, month, dayOfMonth);
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** End of the due window for a recurring payment in the current or next month. */
export function nextDueWindowEnd(
  dueDayEnd: number,
  from = new Date(),
): string {
  return nextDueDateForDay(dueDayEnd, from);
}

export function knownFinanceSeed(now = new Date().toISOString()): {
  accounts: BankAccount[];
  cards: CreditCard[];
  loans: Loan[];
  recurring: RecurringPayment[];
} {
  return {
    accounts: [
      {
        id: "acct_bancolombia_ahorros",
        bank: "Bancolombia",
        label: "Cuenta de ahorros",
        type: "savings",
        currency: "COP",
        notes: "Cuenta de ahorros Bancolombia de Andrea",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "acct_neki",
        bank: "Neki",
        label: "Cuenta Neki",
        type: "other",
        currency: "COP",
        notes: "Cuenta en Neki",
        createdAt: now,
        updatedAt: now,
      },
    ],
    cards: [
      {
        id: "card_bancolombia_personal",
        bank: "Bancolombia",
        label: "Tarjeta de crédito personal",
        currency: "COP",
        notes: "Tarjeta de crédito personal Bancolombia — confirmar día de pago",
        createdAt: now,
        updatedAt: now,
      },
    ],
    loans: [
      {
        id: "loan_bancolombia_hero",
        bank: "Bancolombia",
        label: "Préstamo para Hero",
        kind: "personal",
        currency: "COP",
        notes: "Préstamo Bancolombia denominado «préstamo para Hero» (H E R O)",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "loan_hipotecario",
        bank: "Por confirmar",
        label: "Crédito hipotecario",
        kind: "mortgage",
        currency: "COP",
        notes: "Crédito hipotecario — confirmar banco y día de pago",
        createdAt: now,
        updatedAt: now,
      },
    ],
    recurring: [
      {
        id: "rec_nora_torrente",
        recipient: "Nora Torrente",
        label: "Apoyo mensual a Nora Torrente",
        amount: 500_000,
        amountPendingFromExcel: false,
        currency: "COP",
        dueDayStart: 1,
        dueDayEnd: 5,
        category: "apoyo_familiar",
        notes:
          "Pago mensual de 500.000 pesos a Nora Torrente (madre). Vence dentro de los primeros cinco días de cada mes.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "rec_new_cambridge",
        recipient: "New Cambridge",
        label: "Servicio de transporte New Cambridge",
        amount: null,
        amountPendingFromExcel: true,
        currency: "COP",
        category: "colegios",
        notes:
          "Pago de transporte a New Cambridge. Monto desconocido por ahora — tomarlo del Excel compartido; no inventar valor.",
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}
