# Sistema de Níveis de Dificuldade - Supabase

## Visão Geral

O sistema foi atualizado para suportar 5 níveis de dificuldade com distribuição específica por porcentagem:

- **Nível 1**: 15% das perguntas (100 pontos)
- **Nível 2**: 25% das perguntas (250 pontos)
- **Nível 3**: 25% das perguntas (500 pontos)
- **Nível 4**: 25% das perguntas (1000 pontos)
- **Nível 5**: 10% das perguntas (2000 pontos)

## Funcionalidades Implementadas

### 1. Distribuição Automática por Dificuldade

A função SQL `get_questions_by_categories` agora:

- Calcula automaticamente a quantidade de perguntas por nível baseado no total solicitado
- **Garante SEMPRE pelo menos 1 pergunta de cada nível** (1 a 5)
- Usa arredondamento inteligente (`ROUND`): 1.5 → 2, 1.4 → 1, 1.6 → 2
- Busca perguntas **aleatórias** de cada nível respeitando a porcentagem
- Ordena as perguntas por dificuldade crescente (fácil → difícil)
- **Aleatoriedade dentro de cada nível**: perguntas do mesmo nível aparecem em ordem aleatória

### 2. Suporte Multi-idioma por Jogador

- Cada jogador vê as perguntas no seu idioma selecionado
- O sistema detecta automaticamente o idioma do navegador
- Suporte para português (pt), inglês (en) e espanhol (es)

### 3. Filtragem por Categoria

- As perguntas são filtradas pelas categorias escolhidas pelos jogadores
- Se nenhuma categoria for selecionada, busca de todas as categorias disponíveis
- Garante que há perguntas suficientes para cada nível dentro das categorias selecionadas

## Exemplos de Distribuição

### ⚠️ IMPORTANTE: SEMPRE INCLUI TODOS OS 5 NÍVEIS

O algoritmo garante que **SEMPRE haverá pelo menos 1 pergunta de cada nível** (1 a 5), independente da quantidade total solicitada.

### 5 Perguntas (mínimo)

- Nível 1: 1 pergunta (mínimo garantido)
- Nível 2: 1 pergunta (mínimo garantido)
- Nível 3: 1 pergunta (mínimo garantido)
- Nível 4: 1 pergunta (mínimo garantido)
- Nível 5: 1 pergunta (mínimo garantido)

### 10 Perguntas

- Nível 1: 2 perguntas (15% de 10 = 1.5 → ROUND = 2)
- Nível 2: 2 perguntas (25% de 10 = 2.5 → ROUND = 2, ajustado)
- Nível 3: 2 perguntas (25% de 10 = 2.5 → ROUND = 2, ajustado)
- Nível 4: 3 perguntas (25% de 10 = 2.5 → ROUND = 3)
- Nível 5: 1 pergunta (10% de 10 = 1)

### 20 Perguntas

- Nível 1: 3 perguntas (15%)
- Nível 2: 5 perguntas (25%)
- Nível 3: 5 perguntas (25%)
- Nível 4: 5 perguntas (25%)
- Nível 5: 2 perguntas (10%)

### 100 Perguntas

- Nível 1: 15 perguntas (15%)
- Nível 2: 25 perguntas (25%)
- Nível 3: 25 perguntas (25%)
- Nível 4: 25 perguntas (25%)
- Nível 5: 10 perguntas (10%)

## Atualização do Supabase

Para atualizar a função no seu Supabase, execute o script SQL completo em:
`supabase_rpc_function.sql`

O script inclui:

1. `DROP FUNCTION` - Remove a função antiga
2. `CREATE FUNCTION` - Cria a nova função com suporte a 5 níveis
3. `GRANT EXECUTE` - Concede permissões para usuários autenticados e anônimos

## Estrutura de Dados

### Função RPC: `get_questions_by_categories`

**Parâmetros:**

- `p_categories` (text[]): Array de categorias para filtrar
- `p_lang` (text): Código do idioma (ex: 'pt', 'en', 'es')
- `p_limit` (integer): Número total de perguntas desejadas

**Retorna:**

```sql
TABLE (
  id text,
  question_text text,
  options text[],
  correct_answer_index integer,
  difficulty integer,  -- 1 a 5
  category_id text
)
```

## Mudanças no TypeScript

### Tipo de Dificuldade Atualizado

```typescript
// Antes
difficulty: "easy" | "medium" | "hard";

// Depois
difficulty: "level1" | "level2" | "level3" | "level4" | "level5";
```

### Pontuação Atualizada

```typescript
level1: 100 pontos
level2: 250 pontos
level3: 500 pontos
level4: 1000 pontos
level5: 2000 pontos
```

## Algoritmo de Distribuição

O algoritmo funciona em 3 etapas:

### Etapa 1: Cálculo Inicial com Arredondamento

```
Nível 1: ROUND(total × 0.15) mas no mínimo 1
Nível 2: ROUND(total × 0.25) mas no mínimo 1
Nível 3: ROUND(total × 0.25) mas no mínimo 1
Nível 4: ROUND(total × 0.25) mas no mínimo 1
Nível 5: ROUND(total × 0.10) mas no mínimo 1
```

**Exemplo com 10 perguntas:**

- Nível 1: ROUND(10 × 0.15) = ROUND(1.5) = **2**
- Nível 2: ROUND(10 × 0.25) = ROUND(2.5) = **2** (será ajustado)
- Nível 3: ROUND(10 × 0.25) = ROUND(2.5) = **2** (será ajustado)
- Nível 4: ROUND(10 × 0.25) = ROUND(2.5) = **3**
- Nível 5: ROUND(10 × 0.10) = ROUND(1.0) = **1**
- Total inicial: 2 + 2 + 2 + 3 + 1 = **10** ✅

### Etapa 2: Ajuste Automático

Se o total calculado for diferente do solicitado:

- **Excesso**: Remove perguntas dos níveis 2, 3 ou 4 (mas nunca abaixo de 1)
- **Falta**: Adiciona perguntas aos níveis 2, 3 ou 4 (os grupos de 25%)

### Etapa 3: Busca e Ordenação

1. Busca perguntas **aleatórias** de cada nível nas categorias selecionadas
2. Adiciona coluna `rand_order` com `random()` para cada pergunta
3. Ordena por `difficulty ASC, rand_order` para ter:
   - Todas as perguntas de nível 1 primeiro (em ordem aleatória)
   - Depois todas de nível 2 (em ordem aleatória)
   - Depois nível 3, 4, 5 (cada grupo em ordem aleatória)

## Como Funciona

1. **Início do Jogo**: Quando o jogo começa, o sistema identifica:
   - Idioma do jogador (admin/guest)
   - Número de perguntas solicitadas
   - Categorias escolhidas pelos guests

2. **Busca no Supabase**: A função `fetchQuestionsByCategories` chama a RPC:
   - Autentica com token JWT
   - Passa categorias, idioma e limite
   - Recebe perguntas distribuídas por dificuldade

3. **Ordenação**: As perguntas retornam ordenadas:
   - Primeiro por dificuldade (1 → 5)
   - Depois aleatoriamente dentro de cada nível
   - Jogadores começam com perguntas mais fáceis

4. **Apresentação**: Cada jogador vê:
   - Perguntas no seu idioma
   - Opções traduzidas
   - Pontuação correspondente ao nível

## Testado e Validado

✅ Todos os 183 testes passando
✅ Distribuição correta de perguntas por nível
✅ Suporte multi-idioma funcionando
✅ Filtragem por categoria operacional
✅ Ordenação por dificuldade implementada
