import { z } from "zod";

/**
 * Schemas de validação compartilhados entre backend (tRPC) e frontend (formulário).
 * Manter uma única fonte de verdade evita que as regras do formulário e da API
 * divirjam com o tempo.
 */

export const TITULO_MAX = 100;
export const DESCRICAO_MAX = 500;

const titulo = z
  .string({ error: "O título é obrigatório." })
  .trim()
  .min(1, "O título é obrigatório.")
  .max(TITULO_MAX, `O título deve ter no máximo ${TITULO_MAX} caracteres.`);

// Descrição vazia é normalizada para `undefined`, permitindo "limpar" o campo na edição.
const descricao = z
  .string()
  .trim()
  .max(DESCRICAO_MAX, `A descrição deve ter no máximo ${DESCRICAO_MAX} caracteres.`)
  .optional()
  .transform((value) => (value ? value : undefined));

const id = z.string().min(1, "O id da tarefa é obrigatório.");

export const taskCreateSchema = z.object({ titulo, descricao });

export const taskUpdateSchema = z.object({ id, titulo, descricao });

export const taskIdSchema = z.object({ id });

export const taskListSchema = z.object({
  limit: z.number().int().min(1).max(50).default(10),
  // Cursor opaco usado pelo infinite scroll (ver `listTasks` em src/server/db.ts).
  cursor: z.string().nullish(),
});

/** Quantidade de tarefas por página na listagem (SSR e infinite scroll usam o mesmo valor). */
export const PAGE_SIZE = 10;
