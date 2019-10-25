/**
 * This script extracts azerite trait scaling data from the DBC dump in
 * the SIMC repository.
 *
 * Usage:
 *    node extract.js <path-to-simc>/engine/dbc/generated/sc_spell_data.inc > <WoWAnalyzer-path>/src/common/AZERITE_SCALING.generated.json
 */
const argv = require('process').argv;
const fs = require('fs');
const spellIds = require('./traits.json');

const dbcDump = argv[2];

const dbcLines = fs.readFileSync(dbcDump, { encoding: 'utf8' }).split(/\n/);

// we use regex to find the start locations to pull data from and to
// identify fields.
const SPELL_DATA_COUNT_RE = /#define SPELL_SIZE \((\d+)\)/;
const SPELL_DATA_START_RE = /static struct spell_data_t/;
const SPELL_DATA_RE = /.*{ "([^"]+)".*?,(.+)}.*\/\* ([\d, ]+) \*\//;

const SPELL_EFFECT_COUNT_RE = /#define __SPELLEFFECT_SIZE \((\d+)\)/;
const SPELL_EFFECT_START_RE = /static struct spelleffect_data_t/;
const SPELL_EFFECT_DATA_RE = /.*?{ ([^{}}]+).+/;

// get # of spells
let numSpells = -1;
let i = 0;
for (; i < dbcLines.length; i++) {
  const line = dbcLines[i];
  const match = line.match(SPELL_DATA_COUNT_RE);
  if (!match) {
    continue;
  }
  numSpells = match[1];
  break;
}

// find the start of the spelldata struct
for (; i < dbcLines.length; i++) {
  const line = dbcLines[i];
  const matches = line.search(SPELL_DATA_START_RE);
  if (matches < 0) {
    continue;
  }
  break;
}

i += 1;

const SPELL_DATA = {};
const effects = {};

// read it out. we use the comment associated with it to get the spell
// effect list
//
// Note that JS regex is somewhat limited in that it can't do repeated
// groups
for (let j = 0; j < numSpells; i++ , j++) {
  const line = dbcLines[i];
  const match = line.match(SPELL_DATA_RE);
  if (!match) {
    console.error(line);
    return;
  }
  const [, name, _fields, _effects] = match;
  const fields = _fields.replace(' ', '').split(/,/).map(Number);
  const id = Number(fields[0]);
  const scalingType = fields[6];
  const essenceid = Number(fields[56]);
  const effectList = _effects.split(/, /).map(Number);
  if (spellIds.includes(id)) {
    SPELL_DATA[id] = {
      name, effect_list: effectList,
      scaling_type: scalingType,
      effects: {},
    };
    if (essenceid) {
      SPELL_DATA[id].essence_id = essenceid;
    }
    for (const effect of effectList) {
      effects[effect] = id;
    }
  }
}

// now repeat the above, but for effects instead of spells
let numEffects = -1;
for (; i < dbcLines.length; i++) {
  const line = dbcLines[i];
  const match = line.match(SPELL_EFFECT_COUNT_RE);
  if (!match) {
    continue;
  }
  numEffects = match[1];
  break;
}

for (; i < dbcLines.length; i++) {
  const line = dbcLines[i];
  const matches = line.search(SPELL_EFFECT_START_RE);
  if (matches < 0) {
    continue;
  }
  break;
}

i += 1;

for (let j = 0; j < numEffects; i++ , j++) {
  const line = dbcLines[i];
  const match = line.match(SPELL_EFFECT_DATA_RE);
  if (!match) {
    console.error(line);
    return;
  }
  const fields = match[1].replace(' ', '').split(/,/).map(Number);
  const id = fields[0];
  const effectType = fields[5];
  const avgCoeff = fields[6];

  if (effects[id]) {
    SPELL_DATA[effects[id]].effects[id] = { type: effectType, avg: avgCoeff };
  }
}

// dump out the data. to store in a file, just pipe it
console.log(JSON.stringify(SPELL_DATA, null, 2));
