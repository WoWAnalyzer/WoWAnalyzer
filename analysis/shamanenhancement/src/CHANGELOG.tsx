import React from 'react';

import { HawkCorrigan, Mae, MusicMeister, Vonn } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 11, 11), <>Added stacks and time spent at cap statisctics for <SpellLink id={SPELLS.MAELSTROM_WEAPON.id} /></>, Mae),
  change(date(2020, 11, 8), <>Added uptime statisctics for <SpellLink id={SPELLS.WINDFURY_TOTEM.id} /></>, Mae),
  change(date(2020, 11, 8), <>Added uptime statistic and suggestion for <SpellLink id={SPELLS.LASHING_FLAMES_DEBUFF.id} /></>, Mae),
  change(date(2020, 11, 8), <>Added stack statictics for <SpellLink id={SPELLS.HAILSTORM_TALENT.id} /></>, Mae),
  change(date(2020, 11, 5), <>Added <SpellLink id={SPELLS.FLAME_SHOCK.id} /> statistics</>, Mae),
  change(date(2020, 11, 3), <>Added <SpellLink id={SPELLS.SUNDERING_TALENT.id} /> to offensive cooldowns checklist.</>, Mae),
  change(date(2020, 10, 12), <>Added Maelstrom Weapon stats for <SpellLink id={SPELLS.FERAL_SPIRIT.id} />.</>, Vonn),
  change(date(2020, 10, 12), <>Updated statistics for <SpellLink id={SPELLS.FORCEFUL_WINDS_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 12), <>Added damage statistics for <SpellLink id={SPELLS.ELEMENTAL_ASSAULT_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 12), <>Updated damage statistics for <SpellLink id={SPELLS.HOT_HAND_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 12), <>Added damage statistics for <SpellLink id={SPELLS.FIRE_NOVA_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 12), <>Added damage statistics for <SpellLink id={SPELLS.ICE_STRIKE_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 11), <>Added damage statistics for the new <SpellLink id={SPELLS.HAILSTORM_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 11), <>Added damage statistics for <SpellLink id={SPELLS.STORMFLURRY_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 9), <>Added damage statistics for <SpellLink id={SPELLS.STORMKEEPER_TALENT_ENHANCEMENT.id} />.</>, Vonn),
  change(date(2020, 10, 9), <>Added damage statistics for <SpellLink id={SPELLS.LASHING_FLAMES_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 6), <>Updated spells and abilities for current Shadowlands beta.</>, Vonn),
  change(date(2020, 9, 23), <>Removed <SpellLink id={SPELLS.EARTH_ELEMENTAL.id} /> from recommended offensive spells.</>, MusicMeister),
  change(date(2020, 8, 28), <>First go at removing obsolete Spells and Azerite.</>, HawkCorrigan),
];
