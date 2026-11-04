"use client";

// Error boundary da rota: captura falhas inesperadas na renderização (ex.: erro no SSR).
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-md px-4 py-20">
      <div className="card p-8 text-center">
        <p className="text-4xl" aria-hidden>⚠️</p>
        <h1 className="mt-3 text-xl font-bold">Algo deu errado</h1>
        <p className="mt-2 text-sm text-gray-500">Não foi possível carregar esta página.</p>
        <button onClick={reset} className="btn btn-primary mt-6">
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
