import Link from "next/link";

import { TaskList } from "@/components/TaskList";
import { serverCaller } from "@/server/caller";
import { PAGE_SIZE } from "@/shared/task-schema";

// Os dados mudam a cada requisição (lista em memória), então a página não pode ser
// gerada estaticamente no build: força renderização no servidor a cada acesso (SSR).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // SSR: a primeira página de tarefas é buscada no servidor e já vem no HTML.
  const initialPage = await serverCaller.task.list({ limit: PAGE_SIZE });

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Minhas tarefas</h1>
          <p className="mt-1 text-sm text-gray-500">Mais recentes primeiro. Role para carregar mais.</p>
        </div>
        <Link href="/tarefas/nova" className="btn btn-primary">
          <span aria-hidden>+</span> Nova tarefa
        </Link>
      </div>
      <TaskList initialPage={initialPage} />
    </main>
  );
}
