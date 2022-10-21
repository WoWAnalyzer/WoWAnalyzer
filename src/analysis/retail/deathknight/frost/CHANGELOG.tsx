import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import { Adoraci, joshinator, Khazak, LeoZhekov, Putro, Pendragon, darkpsy3934 } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';


export default [
  change(date(2022, 10, 17), 'Add support for Dragonflight analysis', Khazak),
  change(date(2022, 3, 2), 'Remove improperly applied partial support tag', Khazak),
  change(date(2021, 11, 5), 'Verified 9.1.5 patch changes and bumped support to 9.1.5', darkpsy3934),
  change(date(2021, 8, 19), <> Added <SpellLink id ={SPELLS.DEATHS_DUE.id}/> module </>, Pendragon),
  change(date(2021, 4, 3), 'Verified 9.0.5 patch changes and bumped support to 9.0.5', Adoraci),
  change(date(2021, 3, 7), 'Added Frost specific runeforge suggestions', Khazak),
  change(date(2021, 3, 7), <>Added basic Frost specific suggestions to <SpellLink id={SPELLS.SUPERSTRAIN.id}/></>, Khazak),
  change(date(2021, 2, 17), <> Removed <SpellLink id={SPELLS.DEATH_AND_DECAY.id} /> cooldown tracker for Night Fae players</>, Pendragon),
  change(date(2020, 12, 27), <> Fix a crash in the <SpellLink id={SPELLS.SWARMING_MIST.id} /> module.</>, Putro),
  change(date(2020, 12, 20), <> Added module for <SpellLink id={SPELLS.SWARMING_MIST.id} /> and added RP gained from <SpellLink id={SPELLS.SUPERSTRAIN.id} /> to statistic damage</>, joshinator),
  change(date(2020, 12, 12), <> Added <SpellLink id={SPELLS.SUPERSTRAIN.id} /> module</>, joshinator),
  change(date(2020, 12, 7), 'Updated Abilities with covenant signature and class abilities', Khazak),
  change(date(2020, 11, 13), 'Added analyzer for Hypothermic Presence', Khazak),
  change(date(2020, 11, 5), <> Added manual RP tracking for <SpellLink id={talents.BREATH_OF_SINDRAGOSA_TALENT.id} /> and updated suggestion to target a 25+ second duration</>, Khazak),
  change(date(2020, 10, 27), <> Created statistics for <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> and <SpellLink id={SPELLS.RUNE_OF_HYSTERIA.id} /></>, joshinator),
  change(date(2020, 10, 22), 'Replaced deprecated StatisticBoxes with Statistic', LeoZhekov),
  change(date(2020, 10, 22), 'Tweaked spells for prepatch, fixed bug where abilities that only wasted Runic Power and generated none were not showing up in the resource tab', Khazak),
  change(date(2020, 10, 16), 'Updated Abilities with pre-patch spells', Khazak),
];
