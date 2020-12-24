import React from 'react';

import { Abelito75, Adoraci, Sharrq, Zeboot } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  change(date(2020, 12, 24), <>Added <SpellLink id={SPELLS.DEVOURING_PLAGUE.id} /> uptime tracker.</>, [Adoraci]),
  change(date(2020, 12, 23), <>Added cooldowns section which includes <SpellLink id={SPELLS.VOIDFORM_BUFF.id} />, <SpellLink id={SPELLS.POWER_INFUSION.id} />, and <SpellLink id={SPELLS.BOON_OF_THE_ASCENDED.id} />.</>, [Adoraci]),
  change(date(2020, 12, 22), <>Added <SpellLink id={SPELLS.FORTRESS_OF_THE_MIND_TALENT.id} />, <SpellLink id={SPELLS.DEATH_AND_MADNESS_TALENT.id} />, and <SpellLink id={SPELLS.UNFURLING_DARKNESS_TALENT.id} /> modules.</>, [Adoraci]),
  change(date(2020, 12, 21), <>Corrected spell cooldowns and ID changes from launch.</>, [Adoraci]),
  change(date(2020, 12, 10), <>Corrected Power Infusion spell ID.</>, [Abelito75]),
  change(date(2020, 10, 23), <>Update example log to more recent one.</>, [Adoraci]),
  change(date(2020, 10, 18), <>Converted legacy listeners to new event filters</>, Zeboot),
  change(date(2020, 10, 17), <>Updated for Shadowlands Pre-Patch.</>, [Adoraci]),
  change(date(2020, 9, 21), <>Removed Azerite Traits and Added Event Listeners, Centralized Constants, and Integration Tests. </>, [Sharrq]),
];
