#!/usr/bin/env sh

## Script that will run some of the same checks that the Github Actions will do.
#  This can be useful for local development and getting PRs merged faster
#  since checks can be done locally instead of waiting.

# Set envvars
export CI=true
export GITHUB_BASE_REF=shadowlands

# Check for changelog
node scripts/require-changelog-entry.js
if [ $? -ne 0 ]; then
  echo "New changelog entry has not been added."
  exit 1
fi

# Run Typecheck
yarn typecheck
if [ $? -ne 0 ]; then
  echo "Typecheck failed."
  exit 1
fi

# ESLint
yarn lint --max-warnings=0
if [ $? -ne 0 ]; then
  echo "ESLint failed."
  exit 1
fi

# Interface tests
yarn test:interface --runInBand
if [ $? -ne 0 ]; then
  echo "Interface tests failed."
  exit 1
fi

# Parser tests
yarn test:parser --runInBand
if [ $? -ne 0 ]; then
  echo "Parser tests failed."
  exit 1
fi

# Integration tests
yarn test:integration --runInBand
if [ $? -ne 0 ]; then
  echo "Interface tests failed."
  exit 1
fi

# Build
if [ $1 = 'build' ]; then
  yarn build
  if [ $? -ne 0 ]; then
    echo "Build failed."
    exit 1
  fi
fi

# Verify i18n
yarn extract
yarn lingui compile
if [ $? -ne 0 ]; then
  echo "i18n verification failed."
  exit 1
fi

echo "All steps "
