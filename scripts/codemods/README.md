# codemods

A collection of codemods written to ease migration to new versions of React.

## Usage

```shell
$ pnpm dlx jscodeshift -t ./scripts/codemods/codemod.ts --extensions=ts --parser=ts src/**/*.ts
```

## Codemods

### JSX.Element

Adds an appropriate import for the `JSX` namespace from `react` as it is no longer a global.
