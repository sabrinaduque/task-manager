import { randomUUID } from "crypto";

export interface Task {
  id: string;
  titulo: string;
  descricao?: string;
  /** Timestamp (ms desde epoch) da criação da tarefa. */
  dataCriacao: number;
}

/**
 * "Banco" em memória.
 *
 * O array fica em `globalThis` porque, no Next.js, o route handler do tRPC e os
 * Server Components podem carregar instâncias diferentes deste módulo (camadas de
 * bundle distintas), e o hot reload em desenvolvimento recria os módulos. Sem isso,
 * a página renderizada no servidor e a API poderiam enxergar listas diferentes.
 *
 * Os dados se perdem ao reiniciar o servidor, conforme o enunciado.
 */
const globalForDb = globalThis as unknown as { __tasks?: Task[] };

const tasks: Task[] = (globalForDb.__tasks ??= seed());

/** Algumas tarefas fictícias para que a listagem e o infinite scroll tenham conteúdo. */
function seed(): Task[] {
  const now = Date.now();
  const exemplos = [
    "Revisar documentação do projeto",
    "Configurar pipeline de CI",
    "Escrever testes do módulo de tarefas",
    "Planejar a sprint da próxima semana",
    "Atualizar dependências",
    "Corrigir alinhamento do cabeçalho",
    "Preparar apresentação da demo",
    "Organizar o backlog",
  ];

  return Array.from({ length: 24 }, (_, i) => ({
    id: randomUUID(),
    titulo: `${exemplos[i % exemplos.length]} #${i + 1}`,
    descricao: i % 3 === 0 ? undefined : "Tarefa de exemplo gerada automaticamente.",
    // Espaçadas de 1 em 1 hora, a mais antiga primeiro.
    dataCriacao: now - (24 - i) * 60 * 60 * 1000,
  }));
}

/** Ordem de exibição: mais recentes primeiro; o id desempata timestamps iguais. */
function compare(a: Pick<Task, "dataCriacao" | "id">, b: Pick<Task, "dataCriacao" | "id">) {
  return b.dataCriacao - a.dataCriacao || b.id.localeCompare(a.id);
}

/**
 * Paginação baseada em cursor (keyset), em vez de offset.
 *
 * O cursor codifica a posição (dataCriacao + id) do último item da página anterior.
 * Assim, criar ou excluir tarefas enquanto o usuário rola a lista não faz itens
 * serem pulados ou duplicados — o que aconteceria com offsets — e o cursor continua
 * válido mesmo se o próprio item que o originou tiver sido excluído.
 */
export function listTasks({ limit, cursor }: { limit: number; cursor?: string | null }) {
  const sorted = [...tasks].sort(compare);
  const after = cursor ? decodeCursor(cursor) : null;
  const start = after ? sorted.filter((task) => compare(after, task) < 0) : sorted;

  const items = start.slice(0, limit);
  const last = items[items.length - 1];
  const nextCursor = start.length > limit && last ? encodeCursor(last) : null;

  return { items, nextCursor };
}

function encodeCursor(task: Task) {
  return `${task.dataCriacao}_${task.id}`;
}

function decodeCursor(cursor: string) {
  const [time, ...rest] = cursor.split("_");
  const dataCriacao = Number(time);
  if (!Number.isFinite(dataCriacao) || rest.length === 0) return null;
  return { dataCriacao, id: rest.join("_") };
}

export function getTask(id: string) {
  return tasks.find((task) => task.id === id);
}

export function createTask(data: { titulo: string; descricao?: string }): Task {
  const task: Task = {
    id: randomUUID(),
    titulo: data.titulo,
    descricao: data.descricao,
    dataCriacao: Date.now(),
  };
  tasks.push(task);
  return task;
}

/** Retorna `undefined` se a tarefa não existir; o router converte isso em NOT_FOUND. */
export function updateTask(id: string, data: { titulo: string; descricao?: string }) {
  const task = getTask(id);
  if (!task) return undefined;
  task.titulo = data.titulo;
  task.descricao = data.descricao;
  return task;
}

/** Retorna a tarefa removida, ou `undefined` se ela não existir. */
export function deleteTask(id: string) {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return undefined;
  return tasks.splice(index, 1)[0];
}
