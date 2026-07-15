# Cartas Contra a Humanidade

Party game remoto — versão online de *Cards Against Humanity*, com o baralho oficial traduzido para PT-BR. Jogadores acessam pelo navegador do celular usando um código de sala; um jogador é o anfitrião, e a cada rodada um "Card Czar" escolhe a resposta mais engraçada.

## Como jogar

1. O anfitrião cria uma sala e recebe um código de 4 letras
2. Jogadores entram com o código e escolhem um nome (mínimo 3 jogadores)
3. O anfitrião define a pontuação alvo e inicia a partida
4. A cada rodada:
   - Um jogador vira o Card Czar e uma carta preta é sorteada
   - Os demais escolhem 1 ou 2 cartas brancas da própria mão para responder
   - O Card Czar lê as combinações (anônimas, sem saber quem jogou o quê) e escolhe a mais engraçada
   - Quem venceu ganha um ponto e vira dono da carta preta
5. O jogo termina quando alguém atinge a pontuação alvo

## Stack

- **Frontend:** React + TypeScript + Vite (Firebase Hosting) — `apps/web`
- **Backend:** Firebase Cloud Functions v2 (Admin SDK) + Firestore — `functions`
- **Engine:** pacote local `cah-game-engine` — baralho, embaralhamento, distribuição de mãos, rotação de Card Czar, condição de vitória — `packages/game-engine`
- **Auth:** anônima (guest), sem contas — cada navegador vira uma sessão de jogador

## Estrutura do monorepo

```
apps/web/               # frontend React
functions/               # Cloud Functions (TypeScript)
packages/
  game-engine/            # baralho + regras (pacote local, com testes vitest)
```

## Desenvolvimento local

**Pré-requisitos:** Node >= 20, Firebase CLI

```bash
npm install
```

**Terminal 1 — emuladores Firebase** (Auth · Firestore · Functions):

```bash
firebase emulators:start --only auth,firestore,functions
```

**Terminal 2 — frontend com hot reload:**

```bash
cd apps/web
cp .env.example .env   # e preencha com o config do projeto Firebase
VITE_USE_EMULATORS=1 npm run dev
```

## Build e deploy

```bash
npm run test         # testes do game-engine
npm run build         # compila engine + frontend + functions
firebase deploy       # hosting + functions + firestore rules
```

**Cloud Functions v2 exige o plano Blaze** (pay-as-you-go) do Firebase — o deploy de `functions` falha até o projeto ser migrado no console. **Auth anônima** também precisa ser habilitada manualmente uma vez em Firebase Console → Authentication → Sign-in method → Anonymous.

## Modelo de dados (Firestore)

Ver comentários em `firestore.rules` e nos tipos em `apps/web/src/types.ts` / `packages/game-engine/src/types.ts`. Resumo:

- `rooms/{roomCode}` — estado da sala (status, round, carta preta atual, Card Czar, etc). Somente leitura pro cliente; todo write passa por Cloud Function.
- `rooms/{roomCode}/players/{playerId}` — nome, pontuação, se é anfitrião.
- `rooms/{roomCode}/hands/{playerId}` — mão de cartas brancas, privada (só o dono lê).
- `rooms/{roomCode}/submissions/{playerId}` — submissões brutas da rodada, **nunca legível pelo cliente** (preserva o anonimato das respostas até o reveal). O resultado anonimizado (sem playerId) é publicado em `room.judgingSlots`.

## Licença do conteúdo

O texto das cartas é *Cards Against Humanity*, disponibilizado sob [CC BY-NC-SA 2.0](https://creativecommons.org/licenses/by-nc-sa/2.0/) — uso não comercial, com atribuição, compartilhado sob a mesma licença.
