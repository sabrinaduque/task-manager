import { TRPCError } from "@trpc/server";

import { publicProcedure, router } from "../trpc";
import { createTask, deleteTask, getTask, listTasks, updateTask } from "../db";
import {
  taskCreateSchema,
  taskIdSchema,
  taskListSchema,
  taskUpdateSchema,
} from "@/shared/task-schema";

function notFound(id: string): never {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: `Tarefa "${id}" não encontrada. Ela pode já ter sido excluída.`,
  });
}

export const taskRouter = router({
  // READ: lista paginada por cursor (usada pelo SSR e pelo infinite scroll)
  list: publicProcedure.input(taskListSchema).query(({ input }) => listTasks(input)),

  // READ: busca uma tarefa por id (usada pela página de edição)
  getById: publicProcedure
    .input(taskIdSchema)
    .query(({ input }) => getTask(input.id) ?? notFound(input.id)),

  // CREATE: o schema rejeita títulos vazios ou só com espaços (erro BAD_REQUEST)
  create: publicProcedure.input(taskCreateSchema).mutation(({ input }) => createTask(input)),

  // UPDATE: substitui título e descrição; NOT_FOUND se a tarefa não existir
  update: publicProcedure
    .input(taskUpdateSchema)
    .mutation(({ input: { id, ...data } }) => updateTask(id, data) ?? notFound(id)),

  // DELETE: NOT_FOUND se a tarefa não existir (ex.: excluída em outra aba)
  delete: publicProcedure
    .input(taskIdSchema)
    .mutation(({ input }) => deleteTask(input.id) ?? notFound(input.id)),
});
