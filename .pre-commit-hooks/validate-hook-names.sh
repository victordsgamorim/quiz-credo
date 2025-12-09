#!/bin/bash
# Validar que todos os hooks estão em camelCase

if find src/hooks -name "use-*" 2>/dev/null | grep -q .; then
  echo "❌ Hooks devem ser em camelCase (ex: useMobile, não use-mobile)"
  exit 1
fi
