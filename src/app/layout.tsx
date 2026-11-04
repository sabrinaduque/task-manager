import type { Metadata } from "next";
import Link from "next/link";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gerenciador de Tarefas",
  description: "Sistema simples de gerenciamento de tarefas com Next.js e tRPC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col antialiased">
        <Providers>
          <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
            <div className="mx-auto flex h-14 max-w-3xl items-center px-4">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white" aria-hidden>
                  ✓
                </span>
                Gerenciador de Tarefas
              </Link>
            </div>
          </header>

          <div className="flex-1">{children}</div>

          <footer className="py-6 text-center text-xs text-gray-500">
            Next.js 15 · tRPC · React Query
          </footer>
        </Providers>
      </body>
    </html>
  );
}
