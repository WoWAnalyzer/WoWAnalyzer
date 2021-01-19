import React from 'react';

import { Abelito75, Carrottopp } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  change(date(2021, 1, 10),  <>Update execute range tracker for <SpellLink id={SPELLS.CONDEMN.id} /> on targets above 80% health</>, Carrottopp),
  change(date(2020, 12, 26), <>Added <SpellLink id={SPELLS.SPEAR_OF_BASTION.id} />, <SpellLink id={SPELLS.CONQUERORS_BANNER.id} />, and <SpellLink id={SPELLS.ANCIENT_AFTERSHOCK.id} /> to cooldowns section.</>, Carrottopp),
  change(date(2020, 12, 25), <>Add covenant abilites to statistics.</>, Carrottopp),
  change(date(2020, 12, 17), <>Added some shadowlandisms.</>, Abelito75),
  change(date(2020, 12, 17), <>Removed all BFAisms.</>, Abelito75),
];
