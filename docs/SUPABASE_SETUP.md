# 🔧 Configuração do Supabase para Buscar Perguntas do Schema Quiz

## 📋 Problema Resolvido

O Supabase REST API **não permite** acesso direto a schemas customizados como `quiz` através do client JavaScript. A única forma de acessar schemas customizados é através de **RPC Functions** (funções PostgreSQL).

## ✅ Solução Implementada

The app reads questions through two RPC functions, defined in `supabase_game_question_selection.sql`:

- `get_question_candidates`: random question IDs for every (category, level) pair of the selected
  categories
- `get_questions_by_ids`: the drawn questions with their translations and options

They run on the PostgreSQL server with the owner's permissions (`SECURITY DEFINER`), read the `quiz`
schema tables and can be called from the Supabase JavaScript client with a logged-in session. The
draw itself (levels 1 to 5, category rounds, no repeated questions) runs in the app: see
[Question Selection and Difficulty Levels](./SUPABASE_DIFFICULTY_LEVELS.md).

---

## 🚀 Passos para Configuração

### **Passo 1: Executar a Função SQL no Supabase**

1. Abra o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Cole o conteúdo do arquivo `supabase_game_question_selection.sql`
6. Clique em **Run** para executar

### **Passo 2: Verificar se a Função Foi Criada**

Execute este SQL para verificar:

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_question_candidates', 'get_questions_by_ids');
```

Você deve ver:

```
routine_name             | routine_type
-------------------------|-------------
get_question_candidates  | FUNCTION
get_questions_by_ids     | FUNCTION
```

### **Passo 3: Testar a Função Manualmente**

```sql
-- Up to 3 random candidates per level for 'art' and 'science', with a Portuguese text
SELECT * FROM get_question_candidates(
  ARRAY['art', 'science'],
  ARRAY['pt'],
  3
);

-- Two of those questions in Portuguese, English and Spanish
SELECT * FROM get_questions_by_ids(
  ARRAY['<question-id-1>', '<question-id-2>'],
  ARRAY['pt', 'en', 'es']
);
```

### **Passo 4: Verificar Row Level Security (RLS)**

Se ainda houver erro de permissão, execute:

```sql
-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, roles
FROM pg_policies
WHERE schemaname = 'quiz';

-- Se necessário, desabilitar RLS temporariamente (apenas para testes)
ALTER TABLE quiz.questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz.question_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz.options DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz.option_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz.question_categories DISABLE ROW LEVEL SECURITY;
```

⚠️ **Importante**: Desabilitar RLS é apenas para testes. Em produção, configure políticas apropriadas.

---

## 📁 RPC Function Structure

`get_question_candidates` returns rows with this structure:

```typescript
{
  question_id: string; // Question ID (UUID)
  category_id: string; // Category the question was sampled for
  difficulty: number; // Level (1-5)
  is_recent: boolean; // In p_recent_ids (shown in a recent game)
}
```

`get_questions_by_ids` returns one row per question and language:

```typescript
{
  id: string; // Question ID (UUID)
  lang: string; // Language code (pt, en, es)
  question_text: string; // Translated question text
  options: string[]; // Translated options, ordered by option key
  correct_answer_index: number; // Index of the correct option (0-based, same in every language)
  difficulty: number; // Level (1-5)
}
```

---

## 🧪 How It Works in the Code

1. **The admin clicks "Start"**
2. The code checks the Supabase session (manual login in the AppBar, token kept in a local cache)
3. With the question cache enabled, it reads the IDs shown in the last 24 hours
   (`get_cached_question_ids`)
4. It fetches random candidates for the selected categories:
   ```typescript
   const { data } = await supabase.rpc("get_question_candidates", {
     p_categories: ["art", "science", "history"],
     p_langs: ["pt", "en", "es"],
     p_per_bucket: 3,
     p_recent_ids: recentIds,
   });
   ```
5. `src/services/questionSelection.ts` draws the game: one question per level of the 1 → 5 schedule,
   with the category drawn in rounds and no repeated question
6. It loads the drawn questions in every language (`get_questions_by_ids`), converts them to the
   `Question` format in the order of the draw, and adds their IDs to the cache
   (`cache_user_questions`)

---

## 🔐 Segurança

A função usa `SECURITY DEFINER`, o que significa:

- Ela executa com as permissões do criador da função (você)
- Não depende das permissões do usuário que a chama
- É segura porque:
  - Apenas lê dados (não modifica)
  - Só retorna dados permitidos
  - Não expõe informações sensíveis

---

## ⚠️ Problemas Comuns

### Error: "Could not find the function public.get_question_candidates" (or `get_questions_by_ids`)

**Solution**: The functions were not created. Run `supabase_game_question_selection.sql` again.

### Erro: "permission denied for schema quiz"

**Solução**: A função precisa de `SECURITY DEFINER` (já está no SQL).

### Erro: "No questions found"

**Solução**:

- Verifique se existem perguntas no banco
- Verifique se as categorias existem
- Verifique se há traduções no idioma solicitado

### Nenhum erro mas retorna vazio

**Solução**: Verifique as políticas RLS (Passo 4 acima).

---

## 📝 Manutenção

Para atualizar a função no futuro, basta executar o SQL novamente com `CREATE OR REPLACE FUNCTION`.

---

## ✅ Checklist

- [x] Executei o SQL no Supabase SQL Editor
- [x] Verifiquei que a função foi criada
- [x] Testei a função manualmente e ela retorna dados
- [ ] Configurei/verifiquei as políticas RLS (opcional para desenvolvimento)
- [ ] Testei no aplicativo e as perguntas são carregadas

---

## ✅ Status da Implementação

**Data de conclusão**: 2025-12-18

### O que foi implementado:

1. ✅ **Função RPC criada** no Supabase
2. ✅ **Serviço de autenticação** (`src/services/authService.ts`) - Login manual via AppBar com token em cache local
3. ✅ **Serviço de perguntas** (`src/services/questionService.ts`) - Busca perguntas via RPC
4. ✅ **Hook useQuiz atualizado** - Integra com Supabase
5. ✅ **Tipos TypeScript atualizados** - IDs agora são strings (UUID)

### Resultado do teste manual:

```sql
SELECT * FROM get_question_candidates(ARRAY[]::text[], ARRAY['pt'], 5);
```

✅ **Retornou candidatas em português com sucesso!**

---

**🎉 Pronto! Agora o quiz pode buscar perguntas do schema `quiz` do Supabase!**

---

## 🔑 Redefinição de Senha (`/reset-password`)

A página `src/pages/ResetPassword.tsx` recebe o link do e-mail de recuperação ("Send password recovery") e chama `supabase.auth.updateUser({ password })` com a sessão de recuperação.

### Configuração no Dashboard

1. **Authentication → URL Configuration**
   - **Site URL**: domínio de produção (ex.: `https://<seu-dominio>`)
   - **Redirect URLs**: adicionar `https://<seu-dominio>/reset-password` e, para desenvolvimento, `http://localhost:8080/reset-password`
2. **Authentication → Email Templates → Reset Password**: trocar o link do template por:

   ```html
   <a href="{{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}&type=recovery"
     >Redefinir senha</a
   >
   ```

   > O `{{ .ConfirmationURL }}` padrão redireciona para o **Site URL** (raiz `/`) quando o e-mail é enviado pelo Dashboard ("Send password recovery"), pois não há `redirectTo`. Por isso o template precisa apontar direto para `/reset-password`.

A página trata os três formatos de link: `?token_hash=...&type=recovery`, `?code=...` (PKCE) e sessão já detectada na URL (`#access_token=...`).

### RLS

Não é necessária política RLS: a senha fica em `auth.users`, que o Supabase Auth protege e só permite alterar pelo próprio usuário autenticado com a sessão de recuperação. Nenhuma tabela do schema `public`/`quiz` é lida ou escrita pela página.
