import { defineEval } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["smoke"],
  description: "Seeds known finances and lists them.",
  async test(t) {
    await t.send(
      "Usa la herramienta seed_known_finances para cargar mis cuentas y pagos conocidos, luego lista las finanzas.",
    );
    t.succeeded();
    t.calledTool("seed_known_finances");
  },
});
