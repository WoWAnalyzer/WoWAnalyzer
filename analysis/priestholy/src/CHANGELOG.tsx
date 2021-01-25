import React from 'react';

import { Adoraci, Khadaj, niseko, Zeboot } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { change, date } from 'common/changelog';

export default [
  change(date(2021, 1, 23), <>Added <SpellLink id={SPELLS.TWINS_OF_THE_SUN_PRIESTESS.id} /> legendary.</>, Adoraci),
  change(date(2020, 12, 28), <>Adding support for <SpellLink id={SPELLS.BOON_OF_THE_ASCENDED.id} /></>, Khadaj),
  change(date(2020, 12, 28), <>Adding support for <SpellLink id={SPELLS.MINDGAMES.id} /></>, Khadaj),
  change(date(2020, 12, 28), <>Adding support for <SpellLink id={SPELLS.FAE_GUARDIANS.id} /></>, Khadaj),
  change(date(2020, 12, 28), <>Adding support for <SpellLink id={SPELLS.UNHOLY_NOVA.id} /></>, Khadaj),
  change(date(2020, 12, 21), <>Fixing bugs with <SpellLink id={SPELLS.HARMONIOUS_APPARATUS.id} /> and <SpellLink id={SPELLS.SURGE_OF_LIGHT_TALENT.id} /></>, Khadaj),
  change(date(2020, 12, 15), <>Adding card for <SpellLink id={SPELLS.DIVINE_IMAGE.id} /></>, Khadaj),
  change(date(2020, 12, 10), <>Adding card for <SpellLink id={SPELLS.HARMONIOUS_APPARATUS.id} /></>, Khadaj),
  change(date(2020, 12, 9), <>Adding <SpellLink id={SPELLS.RESONANT_WORDS.id} /> module</>, Khadaj),
  change(date(2020, 12, 1), 'Updating Holy to 9.0.2', Khadaj),
  change(date(2020, 11, 30), <>Fixing a bug with <SpellLink id={SPELLS.PRAYER_OF_MENDING_CAST.id} /> tracking</>, Khadaj),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 10, 2), `Removing Perseverance and adding BodyAndSoul.`, Khadaj),
  change(date(2020, 10, 1), `Making CoH baseline and adding Prayer Circle Talent.`, Khadaj),
  change(date(2020, 10, 1), `Removing Enduring Renewal and adding Renewed Faith.`, Khadaj),
  change(date(2020, 5, 1), `Fixed an issue with the stat weights module that caused Versatility to be undervalued.`, niseko),
  change(date(2019, 10, 25), <>Fixing Holy Nova bug.</>, Khadaj),
  change(date(2019, 10, 22), <>Adding holy priest stat weights module.</>, Khadaj),
  change(date(2019, 10, 20), <>Fixing echo of light crash.</>, Khadaj),
];
