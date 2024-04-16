## Usage

Run this script from the root folder to generate talents into src/common/TALENTS.

If intending to work with talents from an upcoming PTR build, checkout [PTR](#ptr). The recommended
practice is to do work related to the PTR on a separate branch and then merge it in after the PTR
build has hit live.

## Live

To run it once

```shell script
$ npx tsx .\scripts\talents\generate-talents.ts
```

To watch the file continously:

```shell script
$ npx tsx watch .\scripts\talents\generate-talents.ts
```

### Updating SpellPower

In order to update the spell power values used in the talent generation (like mana cost,
fury cost, etc.), follow the below steps:

- Update the `LIVE_WOW_BUILD_NUMBER` value in `scripts/talents/generate-talents.ts` to match the version of WoW you want to use

## PTR

Sometimes, the PTR used for an upcoming version won't be on the `ptr`, it will be on `xptr`. To resolve this, change the `PTR_TALENT_DATA_URL` value to use `xptr` instead of `ptr`.

To run it once

```shell script
$ npx tsx .\scripts\talents\generate-talents.ts --ptr
```

To watch the file continously:

```shell script
$ npx tsx watch .\scripts\talents\generate-talents.ts --ptr
```

### Updating SpellPower

In order to update the spell power values used in the talent generation (like mana cost,
fury cost, etc.), follow the below steps:

- Update the `PTR_WOW_BUILD_NUMBER` value in `scripts/talents/generate-talents.ts` to match the version of WoW you want to use
