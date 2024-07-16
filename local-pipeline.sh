#!/usr/bin/env sh

## Script that will run some of the same checks that the Github Actions will do.
#  This can be useful for local development and getting PRs merged faster
#  since checks can be done locally instead of waiting.

# Set envvars
export CI=true
export GITHUB_BASE_REF=dragonflight

# Check for changelog
if ! node scripts/require-changelog-entry.js;
then
  echo "New changelog entry has not been added."
  exit 1
fi

# Run Typecheck
if ! pnpm run typecheck;
then
  echo "Typecheck failed."
  exit 1
fi

# ESLint
if ! pnpm run lint --max-warnings=0;
then
  echo "ESLint failed."
  exit 1
fi

# Interface tests
if ! pnpm run test:interface --runInBand;
then
  echo "Interface tests failed."
  exit 1
fi

# Parser tests
if ! pnpm run test:parser --runInBand;
then
  echo "Parser tests failed."
  exit 1
fi

# Integration tests
if ! pnpm run test:integration --runInBand;
then
  echo "Interface tests failed."
  exit 1
fi

# Verify i18n
if ! pnpm run extract && pnpm exec lingui compile;
then
  echo "i18n verification failed."
  exit 1
fi

# Build
if [ "$1" = "build" ]; then
  if ! pnpm run build;
  then
    echo "Build failed."
    exit 1
  fi
fi

echo "All steps completed."
