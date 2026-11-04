export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8" aria-busy="true" aria-label="Carregando">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="card animate-pulse p-5">
            <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mt-3 h-3 w-1/2 rounded bg-gray-100 dark:bg-gray-800/60" />
          </div>
        ))}
      </div>
    </main>
  );
}
