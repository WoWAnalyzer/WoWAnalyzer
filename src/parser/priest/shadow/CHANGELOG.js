import React from 'react';

import { Zerotorescue, Khadaj} from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2018, 11, 19), <>Added <SpellLink id={SPELLS.DEATH_THROES.id} /> module.</>, [Khadaj]),
  change(date(2018, 11, 19), <>Added <SpellLink id={SPELLS.VAMPIRIC_EMBRACE.id} /> module.</>, [Khadaj]),
  change(date(2018, 11, 8), <>Added <SpellLink id={SPELLS.DARK_VOID_TALENT.id} />.</>, [Khadaj]),
  change(date(2018, 11, 7), <>Fixed the last proc of <SpellLink id={SPELLS.VOIDFORM_BUFF.id} /> in the checklist. Added azerite trait <SpellLink id={SPELLS.CHORUS_OF_INSANITY.id} />.</>, [Khadaj]),
  change(date(2018, 8, 5), <>Fixed a bug where the Haste gained from <SpellLink id={SPELLS.VOIDFORM_BUFF.id} /> was never removed when not using <SpellLink id={SPELLS.LINGERING_INSANITY_TALENT.id} />.</>, [Zerotorescue]),
  change(date(2018, 8, 5), <>Fixed crash when using <SpellLink id={SPELLS.DARK_ASCENSION_TALENT.id} />.</>, [Zerotorescue]),
  change(date(2018, 6, 22), 'Updated spells and several modules to be compatible with BFA.', [Zerotorescue]),
];
