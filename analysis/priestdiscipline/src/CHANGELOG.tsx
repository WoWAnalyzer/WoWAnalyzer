import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { Adoraci, Khadaj, Ogofo, Oratio, Reglitch, VMakaev, Zeboot, jasper } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import React from 'react';


export default [
  change(date(2021, 4, 9), <>Support for <SpellLink id={SPELLS.CLARITY_OF_MIND.id} /></>, Reglitch),
  change(date(2021, 4, 8), <>Support for <SpellLink id={SPELLS.SHATTERED_PERCEPTIONS.id} /></>, Reglitch),
  change(date(2021, 4, 6), <>9.0.5 support! <SpellLink id={SPELLS.SPIRIT_SHELL_TALENT.id} /> support for everyone!</>, Reglitch),
  change(date(2021, 1, 31), <>Added <SpellLink id={SPELLS.POWER_INFUSION.id} /> to the checklist.</>, jasper),
  change(date(2021, 1, 23), <>Added <SpellLink id={SPELLS.TWINS_OF_THE_SUN_PRIESTESS.id} /> legendary.</>, Adoraci),
  change(date(2020, 12, 28), <>Fixing <SpellLink id={SPELLS.BOON_OF_THE_ASCENDED.id} /></>, Khadaj),
  change(date(2020, 12, 28), <>Adding support for <SpellLink id={SPELLS.FAE_GUARDIANS.id} /></>, Khadaj),
  change(date(2020, 12, 28), <>Adding support for <SpellLink id={SPELLS.UNHOLY_NOVA.id} /></>, Khadaj),
  change(date(2020, 12, 2), <>Fixed damage bonus of <SpellLink id={SPELLS.SCHISM_TALENT.id} /> to 25% to match Shadowlands nerf.</>, VMakaev),
  change(date(2020, 11, 13), <>Implementation of <SpellLink id={SPELLS.SHINING_RADIANCE.id} />.</>, Oratio),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 10, 10), <>Implementation of <SpellLink id={SPELLS.BOON_OF_THE_ASCENDED.id} />.</>, Ogofo),
  change(date(2020, 10, 3), <>Update <SpellLink id={SPELLS.POWER_WORD_SOLACE_TALENT.id} /> cooldown.</>, Reglitch),
  change(date(2020, 10, 2), <>Converting all disc modules to Typescript.</>, Khadaj),
  change(date(2020, 10, 2), <>Implementation of <SpellLink id={SPELLS.MINDGAMES.id} /></>, Oratio),
  change(date(2020, 9, 30), <>Shadowlands Clean up.</>, Oratio),
];
