import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-4 py-20">
      <div className="card p-8 text-center">
        <p className="text-4xl" aria-hidden>🔍</p>
        <h1 className="mt-3 text-xl font-bold">Não encontrado</h1>
        <p className="mt-2 text-sm text-gray-500">A tarefa ou página que você procura não existe ou foi excluída.</p>
        <Link href="/" className="btn btn-primary mt-6">
          Voltar para a lista
        </Link>
      </div>
    </main>
  );
}
