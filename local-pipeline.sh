#!/usr/bin/env sh

## Script that will run some of the same checks that the Github Actions will do.
#  This can be useful for local development and getting PRs merged faster
#  since checks can be done locally instead of waiting.

# Set envvars
export CI=true
export GITHUB_BASE_REF=shadowlands

# Check for changelog
if ! node scripts/require-changelog-entry.js;
then
  echo "New changelog entry has not been added."
  exit 1
fi

# Run Typecheck
if ! yarn typecheck;
then
  echo "Typecheck failed."
  exit 1
fi

# ESLint
if ! yarn lint --max-warnings=0;
then
  echo "ESLint failed."
  exit 1
fi

# Interface tests
if ! yarn test:interface --runInBand;
then
  echo "Interface tests failed."
  exit 1
fi

# Parser tests
if ! yarn test:parser --runInBand;
then
  echo "Parser tests failed."
  exit 1
fi

# Integration tests
if ! yarn test:integration --runInBand;
then
  echo "Interface tests failed."
  exit 1
fi

# Build
if [ "$1" = "build" ]; then
  if ! yarn build;
  then
    echo "Build failed."
    exit 1
  fi
fi

# Verify i18n
if ! yarn extract && yarn lingui compile;
then
  echo "i18n verification failed."
  exit 1
fi

echo "All steps completed."
