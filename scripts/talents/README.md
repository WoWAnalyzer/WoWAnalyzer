np## Usage

Run this script from the root folder to generate talents into src/common/TALENTS.

If intending to work with talents from an upcoming PTR build, checkout [PTR](#ptr). The recommended
practice is to do work related to the PTR on a separate branch and then merge it in after the PTR
build has hit live.

## Live

To run it once

```shell script
$ npx ts-node-dev .\scripts\talents\generate-talents.ts
```

To watch the file continously:

```shell script
$ npx ts-node-dev --respawn .\scripts\talents\generate-talents.ts
```

### Updating SpellPower

In order to update the spell power values used in the talent generation (like mana cost,
fury cost, etc.), follow the below steps:

- Run the below script while providing it a build number

```shell script
$ npx ts-node-dev .\scripts\talents\download-spellpower.ts WOWVERSION
```

- Update the `LIVE_WOW_BUILD_NUMBER` value in `scripts/talents/generate-talents.ts` to match WOWVERSION

## PTR

To run it once

```shell script
$ npx ts-node-dev .\scripts\talents\generate-talents.ts --ptr
```

To watch the file continously:

```shell script
$ npx ts-node-dev --respawn .\scripts\talents\generate-talents.ts --ptr
```

### Updating SpellPower

In order to update the spell power values used in the talent generation (like mana cost,
fury cost, etc.), follow the below steps:

- Run the below script while providing it a build number

```shell script
$ npx ts-node-dev .\scripts\talents\download-spellpower.ts WOWVERSION
```

- Update the `PTR_WOW_BUILD_NUMBER` value in `scripts/talents/generate-talents.ts` to match WOWVERSION
