import { initTRPC } from "@trpc/server";
import { ZodError, z } from "zod";

const t = initTRPC.create({
  /**
   * Erros de validação do Zod são expostos de forma estruturada (`data.zodError`)
   * para que o frontend possa exibir a mensagem junto ao campo correspondente.
   */
  errorFormatter({ shape, error }) {
    const zodError = error.cause instanceof ZodError ? z.flattenError(error.cause) : null;

    return {
      ...shape,
      // Para erros de validação, a mensagem padrão é o JSON das issues; trocamos
      // pela primeira mensagem legível.
      message: zodError ? (firstMessage(zodError) ?? "Dados inválidos.") : shape.message,
      data: { ...shape.data, zodError },
    };
  },
});

function firstMessage(error: { formErrors: string[]; fieldErrors: Record<string, string[] | undefined> }) {
  return error.formErrors[0] ?? Object.values(error.fieldErrors).flat()[0];
}

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
