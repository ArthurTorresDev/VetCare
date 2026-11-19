#!/usr/bin/env bash

set -Eeuo pipefail

# Branch que receberá todas as alterações
TARGET="arthurtorres"

# Branches que serão integradas
SOURCES=(
  "arthursteinerr"
  "Jose_carlos"
  "heitormuniz"
)

echo "======================================"
echo " SINCRONIZAÇÃO DAS BRANCHES VETCARE"
echo "======================================"

# Verifica se estamos dentro de um repositório Git
git rev-parse --is-inside-work-tree >/dev/null

# Verifica se existe um merge ou rebase em andamento
if [ -f "$(git rev-parse --git-path MERGE_HEAD)" ] ||
   [ -d "$(git rev-parse --git-path rebase-merge)" ] ||
   [ -d "$(git rev-parse --git-path rebase-apply)" ]; then
  echo "ERRO: Existe um merge ou rebase em andamento."
  echo "Resolva ou aborte a operação antes de continuar."
  exit 1
fi

# Verifica se existem alterações locais
if [ -n "$(git status --porcelain)" ]; then
  echo "ERRO: Existem alterações locais pendentes."
  echo "Faça commit ou guarde suas alterações antes de continuar."
  git status --short
  exit 1
fi

# Atualiza referências remotas
echo ""
echo "Atualizando referências remotas..."
git fetch --all --prune

# Guarda a branch atual
CURRENT=$(git branch --show-current)

# Muda para a branch de destino
git switch "$TARGET"

# Integra cada branch
for BRANCH in "${SOURCES[@]}"; do

  echo ""
  echo "Integrando origin/$BRANCH..."

  if ! git show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
    echo "ERRO: Branch origin/$BRANCH não encontrada."
    git switch "$CURRENT"
    exit 1
  fi

  if git merge-base HEAD "origin/$BRANCH" >/dev/null 2>&1; then
    git merge --no-edit "origin/$BRANCH" || {
      echo ""
      echo "CONFLITO detectado em $BRANCH."
      echo "Nenhuma alteração conflitante será descartada."
      echo "Resolva os conflitos ou execute git merge --abort."
      exit 1
    }
  else
    echo "Históricos independentes detectados."
    git merge --no-edit --allow-unrelated-histories "origin/$BRANCH" || {
      echo ""
      echo "CONFLITO detectado em $BRANCH."
      echo "Resolva os conflitos ou execute git merge --abort."
      exit 1
    }
  fi

done

echo ""
echo "======================================"
echo " SINCRONIZAÇÃO CONCLUÍDA!"
echo "======================================"

echo ""
echo "Branch atual: $TARGET"
echo "Branches integradas:"
printf ' - %s\n' "${SOURCES[@]}"

echo ""
echo "Para enviar ao remoto, execute:"
echo "git push origin $TARGET"