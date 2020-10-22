import React from 'react';

import { Zerotorescue, Khadaj, Adoraci, Sharrq, Zeboot } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 10, 18), <>Converted legacy listeners to new event filters</>, Zeboot),
  change(date(2020, 10, 17), <>Updated for Shadowlands Pre-Patch.</>, [Adoraci]),
  change(date(2020, 9, 21), <>Removed Azerite Traits and Added Event Listeners, Centralized Constants, and Integration Tests. </>, [Sharrq]),
  change(date(2020, 8, 29), <>Typescript conversion and updated Statistic Boxes. </>, [Sharrq]),
  change(date(2020, 8, 23), <>Updated Talents and Spellbook for Shadowlands. Added Buff Highlights for Timeline. </>, [Sharrq]),
  change(date(2019, 8, 22), <>Added <SpellLink id={SPELLS.SPITEFUL_APPARITIONS.id} /> module.</>, [Adoraci]),
  change(date(2019, 8, 17), <>Added <SpellLink id={SPELLS.WHISPERS_OF_THE_DAMNED.id} /> module.</>, [Adoraci]),
  change(date(2018, 11, 19), <>Added <SpellLink id={SPELLS.DEATH_THROES.id} /> module.</>, [Khadaj]),
  change(date(2018, 11, 19), <>Added <SpellLink id={SPELLS.VAMPIRIC_EMBRACE.id} /> module.</>, [Khadaj]),
  change(date(2018, 11, 8), <>Added Dark Void.</>, [Khadaj]),
  change(date(2018, 11, 7), <>Fixed the last proc of <SpellLink id={SPELLS.VOIDFORM_BUFF.id} /> in the checklist. Added azerite trait <SpellLink id={SPELLS.CHORUS_OF_INSANITY.id} />.</>, [Khadaj]),
  change(date(2018, 8, 5), <>Fixed a bug where the Haste gained from <SpellLink id={SPELLS.VOIDFORM_BUFF.id} /> was never removed when not using Lingering Insanity.</>, [Zerotorescue]),
  change(date(2018, 8, 5), <>Fixed crash when using Dark Ascension.</>, [Zerotorescue]),
  change(date(2018, 6, 22), <>Updated spells and several modules to be compatible with BFA.</>, [Zerotorescue]),
];
