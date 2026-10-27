#!/bin/bash
# Prettier wrapper that stages files after formatting

# Run the project's prettier (package-lock.json) and format files; --no-install keeps npx from
# downloading the latest one, which formats some code differently
npx --no-install prettier --write --ignore-unknown "$@" || exit 1

# Add the formatted files back to the staging area
git add "$@"

exit 0
