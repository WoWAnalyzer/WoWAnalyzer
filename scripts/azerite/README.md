# Azerite Scaling Extractor

This script pulls azerite scaling data from the simc repository (which must be
cloned locally). It should *probably* be replaced by an implementation based on [this
stuff](https://github.com/simulationcraft/simc/wiki/Using-CASC-Extract-and-DBC-Extract).

Poke @emallson for questions/complaints.

## Layout

- `extract.js` -- Does the extraction from simc data.
- `traits.json` -- A list of all relevant trait spell IDs. Note that *multiple
  IDs exist for most traits!* Only the one with scaling data should be added
  here.

## Usage

```sh
$ node extract.js <path-to-simc>/engine/dbc/generated/sc_spell_data.inc > src/common/AZERITE_SCALING.generated.json
```
