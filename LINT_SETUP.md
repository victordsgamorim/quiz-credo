# Configuração de Lint e Formatação

Este projeto está configurado com eslint, Prettier e pre-commit hooks para manter a qualidade e consistência do código.

## Ferramentas

- **ESLint**: Linter de JavaScript/TypeScript com regras rigorosas
- **Prettier**: Formatador de código automático
- **pre-commit**: Framework para gerenciar git hooks
- **GitHub Actions**: CI/CD para validar lint em pull requests

## Instalação Inicial

### 1. Instalar dependências do projeto

```bash
npm install
```

### 2. Instalar pre-commit

#### macOS (com Homebrew)

```bash
brew install pre-commit
```

#### Linux/Windows

```bash
pip install pre-commit
```

Ou consulte: https://pre-commit.com/#install

### 3. Configurar git hooks

```bash
pre-commit install
pre-commit install --hook-type commit-msg
```

## Uso

### Verificar lint

```bash
npm run lint
```

### Corrigir lint automaticamente

```bash
npm run lint:fix
```

### Verificar formatação

```bash
npm run format:check
```

### Corrigir formatação

```bash
npm run format
```

### Rodar todos os checks do pre-commit

```bash
npm run pre-commit
```

## Regras Configuradas

### ESLint

- ✅ TypeScript recomendado
- ✅ React Hooks validação
- ✅ React Refresh
- ✅ Variáveis não utilizadas (com padrão `_` para ignoradas)
- ✅ Sem `console.log` (apenas `warn` e `error` permitidos)
- ✅ Sem `debugger`
- ✅ Prefer `const` (error)
- ✅ Sem `var` (error)
- ✅ Strict equality (`===`) (error)
- ✅ Warnings para `any` types

### Hooks (Convenção)

- ✅ **Todos os hooks devem ser em camelCase** (ex: `useMobile`, `useToast`)
- ✅ Hooks não permitidos em kebab-case (ex: ❌ `use-mobile`, ❌ `use-toast`)
- ✅ Pre-commit hook validará automaticamente a nomeação

### Prettier

- Print width: 100 caracteres
- Tabs: 2 espaços
- Sem single quotes (usa double quotes)
- Trailing commas: ES5
- End of line: LF
- Semicolons: Habilitados

## Pre-commit Hooks

Os seguintes hooks rodam automaticamente ao fazer commit:

1. **Prettier** - Formata código
2. **ESLint** - Valida código
3. **Validate Hook Names** - Garante que hooks sejam em camelCase
4. **End-of-file fixer** - Garante newline final
5. **Trailing whitespace** - Remove espaços extras
6. **Detect private key** - Impede commit de chaves privadas
7. **JSON validator** - Valida arquivos JSON
8. **YAML validator** - Valida arquivos YAML
9. **Conventional commits** - Valida mensagens de commit

## GitHub Actions

Um workflow automático roda em toda PR para validar:

- Prettier (code formatting)
- ESLint (code linting)
- Pre-commit checks

## Workflow de Desenvolvimento

1. **Antes de fazer commit**:

   - O pre-commit rodará automaticamente
   - Se houver problemas de formatação, Prettier os corrigirá
   - Se houver problemas de lint, corrija manualmente ou use `npm run lint:fix`

2. **Ao fazer push**:

   - GitHub Actions validará o código
   - Se houver falhas, corrija localmente e faça push novamente

3. **Em Pull Requests**:
   - GitHub Actions executará os checks
   - PR pode ser mergeado apenas se todos os checks passarem

## Regras de Commit

Este projeto segue **Conventional Commits**. Exemplos válidos:

```
feat: adiciona nova funcionalidade
fix: corrige bug em X
docs: atualiza documentação
style: ajusta formatação
refactor: refatora módulo X
test: adiciona testes para X
chore: atualiza dependências
```

## Troubleshooting

### Pre-commit não está rodando

```bash
# Reinstalar hooks
pre-commit install
pre-commit install --hook-type commit-msg
```

### Erro "hook_stage: commit-msg not supported"

```bash
# Rodar apenas o hook specific
pre-commit run --hook-stage commit-msg
```

### Forçar pre-commit check em todos os arquivos

```bash
npm run pre-commit
```

### Ignorar um check específico

Adicione ao `.pre-commit-config.yaml` para aquele hook:

```yaml
- id: eslint
  stages: [commit]
  # Adicionar nos hooks específicos que quer ignorar
```

## Referências

- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)
- [Pre-commit Documentation](https://pre-commit.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
