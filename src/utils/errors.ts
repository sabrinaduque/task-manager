import { TRPCClientError } from "@trpc/client";

import type { AppRouter } from "@/server/root";

/** Converte erros do tRPC (ou de rede) em uma mensagem amigável para o usuário. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof TRPCClientError) {
    // Sem `data`, a requisição nem chegou a receber uma resposta do tRPC (ex.: servidor fora do ar).
    if (!error.data) return "Não foi possível conectar ao servidor. Tente novamente.";
    return error.message;
  }
  return "Ocorreu um erro inesperado. Tente novamente.";
}

/** Erros de validação por campo vindos do backend (ver `errorFormatter` em src/server/trpc.ts). */
export function getFieldErrors(error: unknown): Record<string, string | undefined> {
  if (!(error instanceof TRPCClientError)) return {};
  const fieldErrors: Record<string, string[] | undefined> =
    (error as TRPCClientError<AppRouter>).data?.zodError?.fieldErrors ?? {};
  return Object.fromEntries(Object.entries(fieldErrors).map(([field, messages]) => [field, messages?.[0]]));
}
