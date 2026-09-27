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
- Histórico de treinos concluídos e progressão de carga por exercício.

## Stack

React + TypeScript + Vite + Tailwind CSS v4 + Supabase (Postgres) para
persistência dos dados de treino.

## Configuração do Supabase

1. Copie `.env.example` para `.env`.
2. A tabela `workout_sessions` já existe no projeto Supabase referenciado.
   Para apontar para outro projeto, troque `VITE_SUPABASE_URL` e
   `VITE_SUPABASE_ANON_KEY` e recrie a tabela com a migration em
   `supabase/migrations/` (ou repita o SQL usado para criá-la).
3. A chave anon/publishable não é secreta — o acesso é controlado por
   Row Level Security no banco, não por esconder essa chave.

## Rodando localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
```
