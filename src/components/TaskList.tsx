"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useToast } from "@/components/Toast";
import type { Task } from "@/server/db";
import { PAGE_SIZE } from "@/shared/task-schema";
import { getErrorMessage } from "@/utils/errors";
import { formatDate } from "@/utils/format";
import { trpc } from "@/utils/trpc";

interface TaskListProps {
  /** Primeira página, carregada no servidor (SSR). */
  initialPage: { items: Task[]; nextCursor: string | null };
}

export function TaskList({ initialPage }: TaskListProps) {
  const showToast = useToast();
  const utils = trpc.useUtils();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // A primeira página vem do SSR como `initialData`, então o HTML já chega com as
  // tarefas e o React Query assume a partir daí (páginas seguintes, refetch, cache).
  const query = trpc.task.list.useInfiniteQuery(
    { limit: PAGE_SIZE },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialData: { pages: [initialPage], pageParams: [null] },
    },
  );

  const deleteMutation = trpc.task.delete.useMutation({
    onMutate: ({ id }) => setDeletingId(id),
    onSuccess: (task) => {
      // Remove o item do cache local imediatamente, sem recarregar todas as páginas.
      utils.task.list.setInfiniteData({ limit: PAGE_SIZE }, (data) =>
        data && {
          ...data,
          pages: data.pages.map((page) => ({ ...page, items: page.items.filter((item) => item.id !== task.id) })),
        },
      );
      showToast("success", `Tarefa "${task.titulo}" excluída.`);
    },
    onError: (error) => {
      showToast("error", `Não foi possível excluir: ${getErrorMessage(error)}`);
      // A tarefa pode ter sido removida por outra aba/usuário: sincroniza com o servidor.
      void utils.task.list.invalidate();
    },
    onSettled: () => setDeletingId(null),
  });

  // Infinite scroll: um elemento "sentinela" no fim da lista dispara a próxima página
  // quando entra na área visível. IntersectionObserver evita escutar o evento de scroll.
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage, isFetchNextPageError } = query;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    // Após uma falha, para de tentar automaticamente; o usuário usa o botão "Tentar novamente".
    if (!sentinel || !hasNextPage || isFetchingNextPage || isFetchNextPageError) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void fetchNextPage();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  const tasks = query.data.pages.flatMap((page) => page.items);

  function handleDelete(task: Task) {
    if (window.confirm(`Excluir a tarefa "${task.titulo}"?`)) {
      deleteMutation.mutate({ id: task.id });
    }
  }

  if (tasks.length === 0 && !hasNextPage) {
    return (
      <div className="card border-dashed px-6 py-14 text-center">
        <p className="text-4xl" aria-hidden>📝</p>
        <h2 className="mt-3 font-semibold">Nenhuma tarefa por aqui</h2>
        <p className="mt-1 text-sm text-gray-500">Crie sua primeira tarefa para começar.</p>
        <Link href="/tarefas/nova" className="btn btn-primary mt-5">
          <span aria-hidden>+</span> Nova tarefa
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ul className="flex flex-col gap-3">
        {tasks.map((task) => {
          const isDeleting = deletingId === task.id;
          return (
            <li
              key={task.id}
              className={`card group border-l-4 border-l-indigo-500 p-5 transition hover:shadow-md ${isDeleting ? "pointer-events-none opacity-50" : ""}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <h2 className="break-words font-semibold leading-snug">{task.titulo}</h2>
                  {task.descricao ? (
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-600 dark:text-gray-400">
                      {task.descricao}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm italic text-gray-400">Sem descrição</p>
                  )}
                  <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500 dark:bg-gray-800">
                    <span aria-hidden>🕒</span> Criada em {formatDate(task.dataCriacao)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link href={`/tarefas/${task.id}/editar`} className="btn btn-secondary btn-sm">
                    Editar
                  </Link>
                  <button onClick={() => handleDelete(task)} disabled={isDeleting} className="btn btn-danger btn-sm">
                    {isDeleting ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div ref={sentinelRef} className="py-8 text-center text-sm text-gray-500">
        {isFetchingNextPage && (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" aria-hidden />
            Carregando mais tarefas...
          </span>
        )}
        {isFetchNextPageError && (
          <span className="text-red-600">
            Erro ao carregar mais tarefas.{" "}
            <button onClick={() => void fetchNextPage()} className="font-medium underline">
              Tentar novamente
            </button>
          </span>
        )}
        {!hasNextPage && tasks.length > 0 && <span>✓ Fim da lista · {tasks.length} {tasks.length === 1 ? "tarefa" : "tarefas"}</span>}
      </div>
    </div>
  );
}
