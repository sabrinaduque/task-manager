"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastKind = "success" | "error";
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

const ToastContext = createContext<((kind: ToastKind, message: string) => void) | null>(null);

/**
 * Notificações simples de sucesso/erro.
 *
 * O provider fica no layout raiz, que persiste entre navegações no client. Assim, uma
 * mensagem disparada no formulário ("Tarefa criada") continua visível depois do
 * redirecionamento para a listagem.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (kind: ToastKind, message: string) => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, kind, message }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.kind === "error" ? "alert" : "status"}
            className={`flex items-start gap-3 rounded-xl border-l-4 bg-white px-4 py-3 text-sm shadow-lg ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10 ${
              toast.kind === "success" ? "border-l-green-500" : "border-l-red-500"
            }`}
          >
            <span aria-hidden className={toast.kind === "success" ? "text-green-600" : "text-red-600"}>
              {toast.kind === "success" ? "✓" : "✕"}
            </span>
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => dismiss(toast.id)} aria-label="Fechar" className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast deve ser usado dentro de <ToastProvider>.");
  return show;
}
