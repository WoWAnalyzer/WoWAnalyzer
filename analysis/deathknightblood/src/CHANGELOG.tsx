import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { Adoraci, joshinator, Yajinni, Zeboot, LeoZhekov, TrellinXp, Pendragon, Tialyss } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';


export default [
  change(date(2022, 4, 6), <>Added <SpellLink id={SPELLS.ENDLESS_RUNE_WALTZ.id} /> and updated <SpellLink id={SPELLS.DEATHS_DUE.id}/> module for <SpellLink id={SPELLS.RAMPANT_TRANSFERENCE.id}/> </>, Tialyss),
  change(date(2022, 3, 26), <>Added CDR tracking for <SpellLink id={SPELLS.CRIMSON_RUNE_WEAPON.id} /> and removed suggestions to only use <SpellLink id={SPELLS.BONESTORM_TALENT.id} /> in AOE</>, Tialyss),
  change(date(2021, 8, 19), <>Added <SpellLink id ={SPELLS.DEATHS_DUE.id}/> module </>, Pendragon),
  change(date(2021, 4, 3), 'Verified 9.0.5 patch changes and bumped support to 9.0.5', Adoraci),
  change(date(2021, 2, 17), <>Fixed issues in modules where <SpellLink id={SPELLS.DEATHS_DUE.id}/> did not correctly replace <SpellLink id={SPELLS.DEATH_AND_DECAY.id} /> </>, Pendragon),
  change(date(2020, 1, 29), <>Fixed Grammar can't and you're</>, TrellinXp),
  change(date(2020, 12, 20), <>Added module for <SpellLink id={SPELLS.SWARMING_MIST.id} /> and added RP gained from <SpellLink id={SPELLS.SUPERSTRAIN.id} /> to statistic damage</>, joshinator),
  change(date(2020, 12, 12), <>Added <SpellLink id={SPELLS.BRYNDAORS_MIGHT.id} /> and <SpellLink id={SPELLS.SUPERSTRAIN.id} /> modules</>, joshinator),
  change(date(2020, 11, 6), 'Runeforge-suggestions', joshinator),
  change(date(2020, 10, 27), <>Created statistics for <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> and <SpellLink id={SPELLS.RUNE_OF_HYSTERIA.id} /></>, joshinator),
  change(date(2020, 10, 26), <>Replaced deprecated StatisticBox modules for talents, disable Ossuary until SL and new <SpellLink id={SPELLS.RELISH_IN_BLOOD_TALENT.id} /> module</>, joshinator),
  change(date(2020, 10, 20), 'Replaced the deprecated StatisticBox modules', LeoZhekov),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 9, 10), <>Changed <SpellLink id={SPELLS.OSSUARY.id} /> from a talent to baseline. Changed <SpellLink id={SPELLS.BLOOD_TAP_TALENT.id} /> to talent.</>, Yajinni),
  change(date(2020, 9, 9), <>Initial clean up and adding of spells for prepatch.</>, Yajinni),
];
