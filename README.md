# Treino Superior

App web mobile-first para acompanhar o plano de treino superior (foco:
emagrecer e ganhar músculo), com 3 treinos alternados — A (Peito + Costas +
Braços), B (Costas + Peito + Ombros) e C (Superior Completo).

## Funcionalidades

- Seleção do treino do dia com resumo de exercícios e cardio.
- Sessão de treino com checklist de séries, campos de carga (kg) e
  repetições, pré-preenchidos com o último valor registrado.
- Timer de descanso automático ao concluir cada série (60-90s conforme o
  exercício).
- Registro de cardio ao final do treino.
- Histórico de treinos concluídos e progressão de carga por exercício,
  tudo salvo localmente no navegador (`localStorage`) — sem backend.

## Stack

React + TypeScript + Vite + Tailwind CSS v4.

## Rodando localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
```
