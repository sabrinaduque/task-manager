import { randomUUID } from "crypto";

export interface Task {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: number;
}

export const tasks: Task[] = [];

export function createTask(data: {
  titulo: string;
  descricao?: string;
}): Task {
  const task: Task = {
    id: randomUUID(),
    titulo: data.titulo,
    descricao: data.descricao,
    dataCriacao: Date.now(),
  };

  tasks.push(task);

  return task;
}