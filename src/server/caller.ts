import { appRouter } from "./root";
import { createCallerFactory } from "./trpc";

/**
 * Caller do tRPC para uso em Server Components.
 *
 * No SSR chamamos os procedures diretamente, sem passar por HTTP: o código é o mesmo
 * da API (incluindo validação e erros), mas sem o custo de uma requisição para o
 * próprio servidor.
 */
export const serverCaller = createCallerFactory(appRouter)({});
