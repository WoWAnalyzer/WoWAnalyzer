import SPELLS from '../../src/common/SPELLS';

const seen = [];

Object.keys(SPELLS)
  .filter(key => !Number.isInteger(key))
  .map(key => SPELLS[key])
  .forEach(spell => {
    if (seen.includes(spell.name)) {
      return;
    }
    console.log(spell.name, spell.id);
    seen.push(spell.name);
  });
