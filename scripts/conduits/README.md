# Conduit Information Generator

This script generates all the necessary information we could ever need (as the situation is right now) regarding conduits.

For future purposes, we might want to set up some filtering so these files only contain unused conduits, and potentially even some automated updating.

Note: This does **NOT** include soulbind abilities at the moment.

Poke @Putro for questions/complaints

## Layout

- `data` -- A folder with 3 json files with all the relevant information that needs to be cross-referenced because all needed information isn't in 1 file -- these are not included by default because they're pretty large data files.
  - `raidbotsConduitsInfo.json` -- downloaded from here https://www.raidbots.com/static/data/live/conduits.json
  - `soulbindconduititem.json` -- downloaded from here https://wow.tools/dbc/?dbc=soulbindconduititem and converted to json using something like https://csvjson.com/csv2json using the "hash" output option.
  - `soulbindconduitrank.json` -- downloaded from here https://wow.tools/dbc/?dbc=soulbindconduitrank and converted to json using something like https://csvjson.com/csv2json using the "hash" output option.
- `conduitSpells.js` -- Contains all the information regarding conduits that would normally go in a SPELLS folder.
- `conduitSpellScaling.js` -- Contains the scaling effect of all the conduits. They are named with a \_EFFECT_BY_RANK suffix to their key name in conduitSpells.js
- `fullConduitInfo.json` -- Contains a LOT more information for each conduit than is displayed in the two output .js files.
- `generateConduitInfo.js` -- The script that generates the above 3 files based off the 3 json files in the data folder.

## Usage

```shell script
$ node generateConduitInfo.js
```
