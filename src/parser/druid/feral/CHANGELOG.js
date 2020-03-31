import React from 'react';

import { Anatta336, Abelito75 } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 3,27), <>Improved thresholds of wasted energy to be precentage based.</>, [Abelito75]),
  change(date(2019, 8, 10), <>Improved tracking of <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> energy use to account for <SpellLink id={SPELLS.BERSERK.id} />. Also highlights low energy bites on the timeline.</>, [Anatta336]),
  change(date(2019, 8, 9), <>Fixed tracking pre-pull use of <SpellLink id={SPELLS.BERSERK.id} /> and <SpellLink id={SPELLS.TIGERS_FURY.id} /> so they're properly counted when calculating cast efficiency.</>, [Anatta336]),
  change(date(2019, 6, 19), <>Improved how finisher combo point use is assessed, low-combo use of <SpellLink id={SPELLS.RIP.id} /> is recognised as correct in certain circumstances.</>, [Anatta336]),
  change(date(2019, 6, 16), <>Changed which buffs are displayed on the timeline view, making rotation-relevant information clearer.</>, [Anatta336]),
  change(date(2019, 3, 6), <>Added tracking of <SpellLink id={SPELLS.GUSHING_LACERATIONS_TRAIT.id} />.</>, [Anatta336]),
  change(date(2019, 2, 26), <>Added tracking of <SpellLink id={SPELLS.IRON_JAWS_TRAIT.id} />.</>, [Anatta336]),
  change(date(2019, 2, 25), <>Updated explanatory text to reflect changes from patch 8.1.</>, [Anatta336]),
  change(date(2019, 2, 23), <>Added tracking of <SpellLink id={SPELLS.JUNGLE_FURY_TRAIT.id} />.</>, [Anatta336]),
  change(date(2019, 2, 8), <>Added tracking of <SpellLink id={SPELLS.UNTAMED_FEROCITY.id} /> and updated <SpellLink id={SPELLS.WILD_FLESHRENDING.id} />.</>, [Anatta336]),
  change(date(2018, 12, 20), <>Updated tracking of <SpellLink id={SPELLS.RIP.id} /> snapshots, and interaction with <SpellLink id={SPELLS.SABERTOOTH_TALENT.id} /> for patch 8.1.</>, [Anatta336]),
  change(date(2018, 10, 10), <>Added tracking to Feral for the <SpellLink id={SPELLS.WILD_FLESHRENDING.id} /> Azerite trait.</>, [Anatta336]),
  change(date(2018, 10, 5), <>Added tracking for using <SpellLink id={SPELLS.SHADOWMELD.id} /> to buff <SpellLink id={SPELLS.RAKE.id} /> damage.</>, [Anatta336]),
  change(date(2018, 8, 11), <>Added tracking for wasted energy from <SpellLink id={SPELLS.TIGERS_FURY.id} /> and a breakdown of how energy is spent.</>, [Anatta336]),
  change(date(2018, 8, 5), <>Added a checklist for Feral.</>, [Anatta336]),
  change(date(2018, 7, 22), <>Corrected <SpellLink id={SPELLS.SAVAGE_ROAR_TALENT.id} /> to only claim credit for damage from abilities it affects in 8.0.1</>, [Anatta336]),
  change(date(2018, 7, 15), <>Fixed bugs with combo generation from AoE attacks and detecting when <SpellLink id={SPELLS.PRIMAL_FURY.id} /> waste is unavoidable.</>, [Anatta336]),
  change(date(2018, 7, 15), <>Added tracking for how <SpellLink id={SPELLS.BLOODTALONS_TALENT.id} /> charges are used.</>, [Anatta336]),
  change(date(2018, 7, 15), 'Added tracking of time spent at maximum energy.', [Anatta336]),
  change(date(2018, 7, 15), <>Added tracking for number of targets hit by <SpellLink id={SPELLS.SWIPE_CAT.id} />, <SpellLink id={SPELLS.THRASH_FERAL.id} />, and <SpellLink id={SPELLS.BRUTAL_SLASH_TALENT.id} />.</>, [Anatta336]),
];
