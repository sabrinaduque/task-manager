"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/components/Toast";
import type { Task } from "@/server/db";
import { DESCRICAO_MAX, TITULO_MAX, taskCreateSchema } from "@/shared/task-schema";
import { getErrorMessage, getFieldErrors } from "@/utils/errors";
import { trpc } from "@/utils/trpc";

type FieldErrors = { titulo?: string; descricao?: string };

interface TaskFormProps {
  /** Quando informado, o formulário edita essa tarefa; caso contrário, cria uma nova. */
  task?: Task;
}

export function TaskForm({ task }: TaskFormProps) {
  const isEditing = Boolean(task);
  const router = useRouter();
  const showToast = useToast();
  const utils = trpc.useUtils();

  const [titulo, setTitulo] = useState(task?.titulo ?? "");
  const [descricao, setDescricao] = useState(task?.descricao ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const mutationOptions = {
    onSuccess: async (saved: Task) => {
      // Invalida a listagem para que ela reflita a alteração ao voltar para "/".
      await utils.task.list.invalidate();
      showToast("success", isEditing ? `Tarefa "${saved.titulo}" atualizada.` : `Tarefa "${saved.titulo}" criada.`);
      router.push("/");
    },
    onError: (error: unknown) => {
      // Erros de validação do backend aparecem junto aos campos; os demais, no topo do formulário.
      setFieldErrors(getFieldErrors(error));
      setFormError(getErrorMessage(error));
    },
  };
  const createMutation = trpc.task.create.useMutation(mutationOptions);
  const updateMutation = trpc.task.update.useMutation(mutationOptions);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  /** Valida no cliente com o mesmo schema usado pelo backend. */
  function validate(values: { titulo: string; descricao: string }): FieldErrors {
    const result = taskCreateSchema.safeParse(values);
    if (result.success) return {};
    const errors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof FieldErrors;
      errors[field] ??= issue.message;
    }
    return errors;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const errors = validate({ titulo, descricao });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return; // impede o envio

    if (task) {
      updateMutation.mutate({ id: task.id, titulo, descricao });
    } else {
      createMutation.mutate({ titulo, descricao });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {formError}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="titulo" className="text-sm font-medium">
          Título <span className="text-red-600">*</span>
        </label>
        <input
          id="titulo"
          value={titulo}
          onChange={(event) => {
            setTitulo(event.target.value);
            // Remove o erro assim que o usuário corrige o campo.
            if (fieldErrors.titulo) setFieldErrors((current) => ({ ...current, titulo: validate({ titulo: event.target.value, descricao }).titulo }));
          }}
          maxLength={TITULO_MAX}
          aria-invalid={Boolean(fieldErrors.titulo)}
          aria-describedby={fieldErrors.titulo ? "titulo-erro" : undefined}
          className="input"
          placeholder="Ex.: Revisar o relatório mensal"
          autoFocus
        />
        {fieldErrors.titulo && (
          <p id="titulo-erro" className="text-xs text-red-600">
            {fieldErrors.titulo}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="descricao" className="text-sm font-medium">
          Descrição <span className="font-normal text-gray-400">(opcional)</span>
        </label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          maxLength={DESCRICAO_MAX}
          rows={5}
          aria-invalid={Boolean(fieldErrors.descricao)}
          aria-describedby={fieldErrors.descricao ? "descricao-erro" : undefined}
          className="input resize-y"
          placeholder="Detalhes, links ou observações"
        />
        <div className="flex justify-between text-xs">
          <p id="descricao-erro" className="text-red-600">
            {fieldErrors.descricao}
          </p>
          <span className="text-gray-400">
            {descricao.length}/{DESCRICAO_MAX}
          </span>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end dark:border-gray-800">
        <Link href="/" className="btn btn-secondary">
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar tarefa"}
        </button>
      </div>
    </form>
  );
}
