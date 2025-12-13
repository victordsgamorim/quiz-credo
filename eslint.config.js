import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactRefreshPlugin from "eslint-plugin-react-refresh";
import jsdocPlugin from "eslint-plugin-jsdoc";
import importPlugin from "eslint-plugin-import-x";

export default tseslint.config(
  // ===========================================
  // Arquivos e pastas ignorados
  // ===========================================
  {
    ignores: [
      "dist",
      "build",
      "node_modules",
      ".venv",
      "venv",
      "*.log",
      ".git",
      ".idea",
      ".vscode",
      "coverage",
      "*.config.js",
      "*.config.ts",
    ],
  },

  // ===========================================
  // Configuração base para TypeScript/React
  // ===========================================
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      jsdocPlugin.configs["flat/recommended-typescript"],
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "react-refresh": reactRefreshPlugin,
      jsdoc: jsdocPlugin,
      "import-x": importPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
      jsdoc: {
        mode: "typescript",
      },
      "import-x/resolver": {
        typescript: true,
      },
    },
    rules: {
      // ===========================================
      // 1. Regras React
      // ===========================================
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // React 17+ não precisa importar React
      "react/prop-types": "off", // Usamos TypeScript para tipos
      "react/no-unknown-property": ["error", { ignore: ["cmdk-input-wrapper"] }], // Propriedade do cmdk
      "react/jsx-pascal-case": ["error", { allowAllCaps: false }],
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "jsdoc/require-jsdoc": "off",

      // ===========================================
      // 2. Regras de Naming Convention
      // ===========================================
      // TODO: Mudar para "error" após refatorar o código existente
      "@typescript-eslint/naming-convention": [
        "warn",
        // Variáveis em camelCase ou UPPER_CASE
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          leadingUnderscore: "allow",
        },
        // Variáveis booleanas devem ter prefixos específicos
        {
          selector: "variable",
          types: ["boolean"],
          format: ["camelCase", "PascalCase"],
          prefix: ["is", "has", "should", "can", "did", "was", "will"],
        },
        // Funções em camelCase (permite PascalCase para componentes React)
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
        },
        // Classes, types, interfaces em PascalCase (sem prefixo I)
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        // Parâmetros em camelCase
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
      ],

      // ===========================================
      // 3. Limites de Tamanho e Complexidade
      // ===========================================
      "max-lines-per-function": [
        "warn",
        {
          max: 50,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "max-params": ["warn", { max: 3 }],
      complexity: ["warn", { max: 8 }],
      "max-depth": ["warn", { max: 3 }],
      "max-lines": [
        "warn",
        {
          max: 250,
          skipBlankLines: true,
          skipComments: true,
        },
      ],

      // ===========================================
      // 4. Regras de Qualidade e Estilo
      // ===========================================
      // Proibir `any` explícito
      "@typescript-eslint/no-explicit-any": "error",

      // Proibir variáveis não usadas (com exceção de _ prefix)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Exigir === e !==
      eqeqeq: ["error", "always"],

      // Preferir const
      "prefer-const": "error",

      // Proibir console.log (permitir error e warn)
      // TODO: Mudar para "error" após refatorar o código existente
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // Proibir eval e similares
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",

      // Evitar non-null assertion (!)
      "@typescript-eslint/no-non-null-assertion": "warn",

      // Outras regras de qualidade
      "no-var": "error",
      "no-debugger": "error",

      // Regras de unsafe (relaxadas para transição gradual)
      // TODO: Mudar para "error" após adicionar tipos corretos
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",

      // ===========================================
      // 5. Regras Específicas de TypeScript
      // ===========================================
      // Proibir promises "flutuantes"
      // TODO: Mudar para "error" após refatorar o código existente
      "@typescript-eslint/no-floating-promises": "warn",

      // Condições com booleano estrito (configurado para React)
      // NOTA: Requer strictNullChecks: true no tsconfig.json para funcionar
      // Desabilitado temporariamente - habilitar após configurar strictNullChecks
      "@typescript-eslint/strict-boolean-expressions": "off",

      // Padronizar type vs interface (usar type)
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],

      // ===========================================
      // 6. Regras de Import/Organização
      // ===========================================
      // Ordenar imports por grupos
      "import-x/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
          pathGroups: [
            {
              pattern: "react",
              group: "builtin",
              position: "before",
            },
            {
              pattern: "@/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      // Proibir imports não usados
      "import-x/no-duplicates": "error",

      // Evitar ciclos de import
      "import-x/no-cycle": ["warn", { maxDepth: 3 }],

      // ===========================================
      // 7. Documentação JSDoc
      // ===========================================
      "jsdoc/require-jsdoc": "off",
      "jsdoc/require-param": [
        "warn",
        {
          checkDestructuredRoots: false,
        },
      ],
      "jsdoc/require-returns": "warn",
      "jsdoc/check-tag-names": "error",
      "jsdoc/check-types": "off", // Desabilitado para TypeScript (usa tipos do TS)
      "jsdoc/check-param-names": "warn",
      "jsdoc/require-description": [
        "warn",
        {
          contexts: ["FunctionDeclaration", "ArrowFunctionExpression", "ClassDeclaration"],
        },
      ],
      "jsdoc/tag-lines": ["warn", "any", { startLines: 1 }],
      // Desabilitar regras JSDoc que conflitam com TypeScript
      "jsdoc/require-param-type": "off",
      "jsdoc/require-returns-type": "off",
      "jsdoc/no-types": "error", // Forçar uso de tipos TypeScript ao invés de JSDoc types
    },
  },

  // ===========================================
  // Configuração especial para arquivos JS
  // ===========================================
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        ...globals.es2020,
      },
    },
    rules: {
      "no-console": "off", // Permitir console em arquivos de config/scripts
    },
  }
);
