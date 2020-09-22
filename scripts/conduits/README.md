# Conduit Information Generator

This script generates all the necessary information we could ever need (as the situation is right now) regarding conduits. 

For future purposes, we might want to set up some filtering so these files only contain unused conduits, and potentially even some automated updating.

Poke @Putro for questions/complaints

## Layout
- `data` -- A folder with 3 json files with all the relevant information that needs to be cross-referenced because all needed information isn't in 1 file
- `conduitItems.js` -- Contains all the information regarding conduits that would normally go in an ITEMS folder, unsure if this will ever be needed.
- `conduitSpells.js` -- Contains all the information regarding conduits that would normally go in a SPELLS folder.
- `fullConduitInfo.json` -- Contains a LOT more information for each conduit than is displayed in the two output .js files.
- `generateConduitInfo.js` -- The script that generates the above 3 files based off the 3 json files in the data folder.

## Usage
```shell script
$ node generateConduitInfo.js
```
