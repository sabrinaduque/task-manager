# Gerenciador de Tarefas — Next.js 15 + tRPC

Aplicação simples de gerenciamento de tarefas. O backend expõe um CRUD via **tRPC** e mantém as
tarefas **em memória**; o frontend usa **Server-Side Rendering** para a listagem, **infinite scroll**
e formulários com validação.

> Todos os dados são fictícios. Ao iniciar, o servidor cria 24 tarefas de exemplo para que a
> paginação possa ser vista em funcionamento. Reiniciar o servidor apaga as alterações.

## Como executar

Requisitos: Node.js 18.18+ (testado com Node 24).

```bash
npm install
npm run dev          # desenvolvimento em http://localhost:3000
```

Build de produção:

```bash
npm run build
npm start
```

## Funcionalidades

| Rota | Descrição |
| --- | --- |
| `/` | Listagem pré-carregada via SSR, com infinite scroll e exclusão com feedback |
| `/tarefas/nova` | Formulário de criação |
| `/tarefas/[id]/editar` | Formulário de edição (a tarefa é carregada no servidor) |
| `/api/trpc/*` | Endpoints tRPC |

### API (tRPC — `task.*`)

| Procedure | Tipo | Entrada | Erros |
| --- | --- | --- | --- |
| `list` | query | `{ limit?, cursor? }` → `{ items, nextCursor }` | — |
| `getById` | query | `{ id }` | `NOT_FOUND` |
| `create` | mutation | `{ titulo, descricao? }` | `BAD_REQUEST` (título vazio, tamanho) |
| `update` | mutation | `{ id, titulo, descricao? }` | `NOT_FOUND`, `BAD_REQUEST` |
| `delete` | mutation | `{ id }` | `NOT_FOUND` |

Modelo da tarefa: `id` (UUID gerado), `titulo` (obrigatório, até 100 caracteres), `descricao`
(opcional, até 500 caracteres) e `dataCriacao` (timestamp em ms).

## Estrutura

```
src/
├── app/
│   ├── api/trpc/[trpc]/route.ts   # handler HTTP do tRPC
│   ├── page.tsx                   # listagem (Server Component, SSR)
│   ├── tarefas/nova/page.tsx      # criação
│   ├── tarefas/[id]/editar/       # edição
│   ├── providers.tsx              # React Query + cliente tRPC + toasts
│   └── loading / error / not-found
├── components/
│   ├── TaskList.tsx               # lista, infinite scroll e exclusão
│   ├── TaskForm.tsx               # formulário de criação/edição
│   └── Toast.tsx                  # mensagens de sucesso/erro
├── server/
│   ├── db.ts                      # "banco" em memória + paginação
│   ├── routers/task.ts            # procedures do CRUD
│   ├── trpc.ts                    # inicialização e formatação de erros
│   └── caller.ts                  # caller usado pelo SSR
└── shared/task-schema.ts          # schemas Zod usados no backend e no formulário
```

## Principais decisões

- **Validação compartilhada.** Os schemas Zod de `src/shared/task-schema.ts` são usados tanto pelos
  procedures quanto pelo formulário. Assim, o cliente impede o envio de dados inválidos (ex.: título
  vazio ou só com espaços) e o servidor revalida com as mesmas regras.
- **Erros significativos.** Recursos inexistentes geram `NOT_FOUND` com mensagem explicativa. Erros
  de validação retornam a mensagem legível e, em `data.zodError`, os erros por campo, que o formulário
  exibe ao lado de cada input.
- **SSR sem HTTP interno.** As páginas chamam os procedures pelo `createCaller` do tRPC, sem fazer uma
  requisição ao próprio servidor. A primeira página da lista é passada como `initialData` ao
  `useInfiniteQuery`; a partir daí, o React Query cuida das páginas seguintes e do cache.
- **Paginação por cursor.** O cursor codifica `dataCriacao + id` do último item carregado. Criar ou
  excluir tarefas durante a rolagem não faz itens serem pulados ou repetidos, como aconteceria com offset.
- **Infinite scroll com `IntersectionObserver`.** Um elemento sentinela no fim da lista carrega a
  próxima página ao ficar visível. Se a busca falhar, o carregamento automático para e aparece um botão
  "Tentar novamente".
- **Estado em `globalThis`.** No Next.js, o route handler e os Server Components podem carregar
  instâncias diferentes de um módulo, e o hot reload recria módulos em desenvolvimento. Guardar o array
  em `globalThis` garante uma única lista por processo.
- **Feedback ao usuário.** Os toasts ficam no layout raiz e sobrevivem à navegação, então a mensagem
  "Tarefa criada" continua visível após voltar para a listagem. Botões mostram estados de carregamento
  ("Salvando...", "Excluindo...") e ficam desabilitados para evitar envios duplicados.

## Limitações

- Os dados ficam na memória de um único processo: não são compartilhados entre instâncias nem
  sobrevivem a reinicializações. Em produção, `db.ts` seria trocado por um banco de dados.
- Por causa do `loading.tsx` (streaming), uma tarefa inexistente em `/tarefas/[id]/editar` exibe a
  página "Não encontrado" (com `noindex`), mas a resposta HTTP tem status 200.
