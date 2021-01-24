import React from 'react';

import { Abelito75, Carrottopp, Otthopsy } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';

export default [
  change(date(2021, 1, 23), <>Updated the module tracking the use of <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> during execution phase.</>, Otthopsy),
  change(date(2021, 1, 13), <>Added a module to track the uptime of <SpellLink id={SPELLS.MASTERY_DEEP_WOUNDS_DEBUFF.id} icon /> during execution phase and if it was refreshed too early or too late.</>, Otthopsy),
  change(date(2021, 1, 10),  <>Update execute range tracker for <SpellLink id={SPELLS.CONDEMN.id} /> on targets above 80% health</>, Carrottopp),
  change(date(2020, 12, 26), <>Added <SpellLink id={SPELLS.SPEAR_OF_BASTION.id} />, <SpellLink id={SPELLS.CONQUERORS_BANNER.id} />, and <SpellLink id={SPELLS.ANCIENT_AFTERSHOCK.id} /> to cooldowns section.</>, Carrottopp),
  change(date(2020, 12, 25), <>Add covenant abilites to statistics.</>, Carrottopp),
  change(date(2020, 12, 17), <>Added some shadowlandisms.</>, Abelito75),
  change(date(2020, 12, 17), <>Removed all BFAisms.</>, Abelito75),
];
