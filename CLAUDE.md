# CLAUDE.md

Guia para trabalhar neste repositório: party game remoto "Cartas Contra a Humanidade" (Cards Against Humanity traduzido), hospedado no Firebase, no mesmo esquema de outros projetos da usuária (Lobisomem do Sertão, Bombolão, decifragem).

## Comandos principais

```bash
npm install
npm run test                                       # testes do game-engine (vitest)
npm run build                                       # engine + web (vite build) + functions (esbuild)
npm run dev                                          # frontend com hot reload (web)
firebase emulators:start --only auth,firestore,functions   # emuladores locais
firebase deploy                                      # hosting + functions + firestore rules/indexes
```

## Arquitetura

Monorepo com npm workspaces, igual ao Lobisomem do Sertão:

- `apps/web` — React + TypeScript + Vite, Firebase Hosting. Sem roteador — um único `App.tsx` troca de tela conforme `room.status`.
- `functions` — Cloud Functions v2 (Admin SDK), TypeScript → esbuild → `lib/index.js`. **Única fonte de escrita** no Firestore.
- `packages/game-engine` (`cah-game-engine`) — dados das cartas + lógica pura (baralho, distribuição, rotação de Czar, condição de vitória), com testes vitest. Importado tanto por `functions` quanto por `apps/web`.

Auth é anônima (guest) — sem login, sem contas. Cada navegador gera uma sessão via `signInAnonymously`; `playerId` + `roomCode` ficam em `localStorage` (`apps/web/src/lib/session.ts`) pra sobreviver a reload.

### Fluxo da partida

`lobby → submitting → judging → (submitting da próxima rodada | ended)`. Ver `functions/src/handlers/game.ts`:

- `createRoom` / `joinRoom` — `functions/src/handlers/room.ts`
- `startGame` — embaralha os dois baralhos, distribui 10 cartas brancas por jogador, sorteia Card Czar e primeira carta preta
- `submitCards` — jogador não-Czar envia 1 ou 2 cartas (`room.blackCardPick`); quando todos enviam, monta `judgingSlots` embaralhados e anônimos
- `czarPick` — concede ponto, verifica vitória, repõe mãos e avança pra próxima rodada (ou encerra)
- `restartGame` — host only, zera scores e volta pro lobby

### Anonimato das respostas

O ponto central da graça do jogo é o Card Czar não saber quem escreveu cada resposta — e os outros jogadores também não devem conseguir espionar. Por isso:

- `rooms/{roomCode}/submissions/{playerId}` **nunca é legível pelo cliente** (`firestore.rules`: `allow read: if false`) — é estado interno das Cloud Functions.
- O reveal público vive em `room.judgingSlots: {slotId, cardIds}[]` — sem `playerId`.
- O mapeamento `slotId → playerId` fica em `rooms/{roomCode}/judgingSecrets/current`, uma subcoleção **sem nenhuma regra declarada** (logo, implicitamente bloqueada pro cliente — Firestore nega por padrão o que não tem match nas rules).
- Ao final da rodada, `judgingSecrets/current` e as `submissions` da rodada são apagadas.

### Texto das cartas

`packages/game-engine/src/data/cards.pt-br.ts` — 460 cartas brancas + 90 pretas (76 Pick 1 + 14 Pick 2), transcritas do PDF oficial em PT-BR fornecido pela usuária. **Ids são a posição no array (1-based) — nunca reordenar ou remover itens do meio**, só adicionar no fim; salas em andamento guardam só o id, não o texto. As duas cartas originais "DRAW 2 / PICK 3" (`+ + =` e "Faça um haiku") viram Pick 2 na v1 pra simplificar — não hávia distribuição de carta extra por elas.

Texto nunca trafega pelo Firestore/Functions — só os ids. `whiteCardText` / `blackCardText` (`packages/game-engine/src/deck.ts`) resolvem o texto no cliente.

## Escopo da v1 / próximos passos

- Implementadas: regras básicas + Pick 2, pontuação alvo configurável pelo anfitrião, restart.
- Não implementadas (propositalmente, ficam pra depois): house rules do manual original (Rebooting the Universe, Packing Heat, Rando Cardrissian, etc.), apostas de Awesome Point, reconexão entre dispositivos diferentes, tratamento de jogador desconectado a meio de rodada.
- Design é propositalmente minimalista (`apps/web/src/styles.css`, CSS puro sem framework) pra ser fácil de iterar depois do MVP.

## Deploy — passos manuais únicos

Cloud Functions v2 exige o projeto no **plano Blaze** — upgrade só pelo console (precisa de cartão vinculado), CLI não consegue fazer isso. **Auth anônima** também precisa ser habilitada uma vez em Firebase Console → Authentication → Sign-in method → Anonymous. Depois desses dois passos, `firebase deploy` completa normalmente.
