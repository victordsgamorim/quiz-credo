# 🔧 Configuração do Supabase para Buscar Perguntas do Schema Quiz

## 📋 Problema Resolvido

O Supabase REST API **não permite** acesso direto a schemas customizados como `quiz` através do client JavaScript. A única forma de acessar schemas customizados é através de **RPC Functions** (funções PostgreSQL).

## ✅ Solução Implementada

Foi criada uma função RPC `get_questions_by_categories` que:

- Executa no servidor PostgreSQL com permissões completas
- Acessa as tabelas do schema `quiz`
- Retorna as perguntas já montadas com traduções e opções
- Pode ser chamada através do client JavaScript do Supabase

---

## 🚀 Passos para Configuração

### **Passo 1: Executar a Função SQL no Supabase**

1. Abra o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Cole o conteúdo do arquivo `supabase_rpc_function.sql`
6. Clique em **Run** para executar

### **Passo 2: Verificar se a Função Foi Criada**

Execute este SQL para verificar:

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_questions_by_categories';
```

Você deve ver:

```
routine_name                 | routine_type
-----------------------------|-------------
get_questions_by_categories  | FUNCTION
```

### **Passo 3: Testar a Função Manualmente**

```sql
-- Buscar 5 perguntas em português das categorias 'art' e 'science'
SELECT * FROM get_questions_by_categories(
  ARRAY['art', 'science'],
  'pt',
  5
);

-- Buscar 10 perguntas em inglês de todas as categorias
SELECT * FROM get_questions_by_categories(
  ARRAY[]::text[],
  'en',
  10
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

## 📁 Estrutura da Função RPC

A função retorna um array de objetos com a seguinte estrutura:

```typescript
{
  id: number;                  // ID da pergunta
  question_text: string;       // Texto da pergunta traduzido
  options: string[];           // Array com as 4 opções traduzidas
  correct_answer_index: number; // Índice da resposta correta (0-3)
  difficulty: number;          // Dificuldade (1=easy, 2=medium, 3=hard)
  category_id: string;         // ID da categoria
}
```

---

## 🧪 Como Funciona no Código

1. **Usuário clica em "Começar o Quiz"**
2. O código faz autenticação com Supabase (obtém JWT token)
3. Chama a função RPC:
   ```typescript
   const { data } = await supabase.rpc("get_questions_by_categories", {
     p_categories: ["art", "science", "history"],
     p_lang: "pt",
     p_limit: 10,
   });
   ```
4. A função RPC:
   - Filtra perguntas pelas categorias selecionadas
   - Embaralha as perguntas
   - Pega apenas 10 perguntas
   - Busca traduções no idioma solicitado
   - Monta as opções em ordem
   - Retorna tudo pronto para uso
5. O código converte para o formato `Question` e usa no quiz

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

### Erro: "function get_questions_by_categories does not exist"

**Solução**: A função não foi criada. Execute o SQL novamente.

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
2. ✅ **Serviço de autenticação** (`src/services/authService.ts`) - Autentica automaticamente
3. ✅ **Serviço de perguntas** (`src/services/questionService.ts`) - Busca perguntas via RPC
4. ✅ **Hook useQuiz atualizado** - Integra com Supabase
5. ✅ **Tipos TypeScript atualizados** - IDs agora são strings (UUID)

### Resultado do teste manual:

```sql
SELECT * FROM get_questions_by_categories(ARRAY[]::text[], 'pt', 5);
```

✅ **Retornou 5 perguntas em português com sucesso!**

---

**🎉 Pronto! Agora o quiz pode buscar perguntas do schema `quiz` do Supabase!**
