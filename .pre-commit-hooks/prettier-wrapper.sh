#!/bin/bash
# Prettier wrapper that stages files after formatting

# Run prettier and format files
npx prettier --write --ignore-unknown "$@"

# Add the formatted files back to the staging area
git add "$@"

exit 0
