import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";

import { FormPageShell } from "@/components/PageShell";
import { TaskForm } from "@/components/TaskForm";
import { serverCaller } from "@/server/caller";

export const dynamic = "force-dynamic";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const task = await serverCaller.task.getById({ id }).catch((error) => {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") notFound();
    throw error;
  });

  return (
    <FormPageShell title="Editar tarefa">
      <TaskForm task={task} />
    </FormPageShell>
  );
}
