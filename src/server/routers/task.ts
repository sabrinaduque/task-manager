import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { router, publicProcedure } from "../trpc";
import { tasks, createTask } from "../db";

export const taskRouter = router({

  // READ: Listar tarefas
  getAll: publicProcedure.query(() => {
    return tasks;
  }),

  // READ: Buscar tarefa por ID
  getById: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(({ input }) => {
      const task = tasks.find(
        (item) => item.id === input.id
      );

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found.",
        });
      }

      return task;
    }),

  // CREATE: Criar tarefa
  create: publicProcedure
    .input(
      z.object({
        titulo: z.string().trim().min(1, "Title is required."),
        descricao: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      return createTask(input);
    }),

  // UPDATE: Atualizar tarefa
  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        titulo: z.string().trim().min(1).optional(),
        descricao: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const task = tasks.find(
        (item) => item.id === input.id
      );

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found.",
        });
      }

      if (input.titulo !== undefined) {
        task.titulo = input.titulo;
      }

      if (input.descricao !== undefined) {
        task.descricao = input.descricao;
      }

      return task;
    }),

  // DELETE: Excluir tarefa
  delete: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(({ input }) => {
      const index = tasks.findIndex(
        (item) => item.id === input.id
      );

      if (index === -1) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found.",
        });
      }

      tasks.splice(index, 1);

      return {
        success: true,
        message: "Task deleted successfully.",
      };
    }),

});