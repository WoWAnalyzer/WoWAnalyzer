## lint-baseline

Simple helper to establish a lint error baseline for CI.

The reason this exists is to help us migrate ESLint configs, and not get stuck needing to fix _every_ new warning / error. Many involve old TS ports or old JS code that
just hasn't been updated yet.

### Usage

Most of the time you should use the `pnpm` scripts:

```bash
pnpm run lint-baseline
```

or this to update it:

```bash
pnpm run lint-baseline update
```
