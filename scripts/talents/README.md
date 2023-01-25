## Usage

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

- Log into one of your characters on live
- Close the game
- Clone https://github.com/simulationcraft/simc
- `cd` into the `casc_extract` directory in the root of the repository
- Run `pip install -r requirements.txt`
- `cd` into the `db_extract3` directory in the root of the repository
- Run `pip install -r requirements.txt`
- `cd` back into the `casc_extract` directory
- Run `WinGenerateSpellData.bat`
- Check the `casc_extract/wow/WOWVERSION/DBFilesClient` directory for `SpellPower.db2` file
- Download [DBC2CSV](https://github.com/Marlamin/DBC2CSV), making sure to install the prerequisites
- Drag the `SpellPower.db2` file onto the DBC2CSV.exe
- Copy the created `SpellPower.csv` into the `scripts/talents` directory, changing the name to `spellpower_WOWVERSION.csv`
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

- Log into one of your characters on live
- Close the game
- Clone https://github.com/simulationcraft/simc
- `cd` into the `casc_extract` directory in the root of the repository
- Run `pip install -r requirements.txt`
- `cd` into the `db_extract3` directory in the root of the repository
- Run `pip install -r requirements.txt`
- `cd` back into the `casc_extract` directory
- Run `WinGenerateSpellDataPTR.bat`
- Check the `casc_extract/wow_ptr/WOWVERSION/DBFilesClient` directory for `SpellPower.db2` file
- Download [DBC2CSV](https://github.com/Marlamin/DBC2CSV), making sure to install the prerequisites
- Drag the `SpellPower.db2` file onto the DBC2CSV.exe
- Copy the created `SpellPower.csv` into the `scripts/talents` directory, changing the name to `spellpower_WOWVERSION.csv`
- Update the `PTR_WOW_BUILD_NUMBER` value in `scripts/talents/generate-talents.ts` to match WOWVERSION
