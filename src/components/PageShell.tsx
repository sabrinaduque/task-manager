import Link from "next/link";

/** Moldura comum às páginas de formulário: link de voltar, título e conteúdo em um cartão. */
export function FormPageShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/" className="text-sm text-gray-500 hover:text-indigo-600">
        ← Voltar para a lista
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold tracking-tight">{title}</h1>
      <div className="card p-6">{children}</div>
    </main>
  );
}
