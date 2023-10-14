import { change, date } from 'common/changelog';
import { Arlie, emallson, Putro, Swolorno, ToppleTheNun, Trevor } from 'CONTRIBUTORS';
import { ItemLink, SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/hunter';
import ITEMS from 'common/ITEMS';
export default [
  change(date(2023, 10, 3), <>Add <SpellLink spell={TALENTS.STEEL_TRAP_TALENT} /> as a trackable talent. </>, Putro),
  change(date(2023, 7, 3), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 6, 4), <>Add <ItemLink id={ITEMS.CALL_TO_DOMINANCE.id}/> module to hunter</>, Trevor),
  change(date(2023, 5, 9), <>Added support for T29 tier sets</>, Swolorno),
  change(date(2023, 1, 30), 'Fixed a crashing bug in the Checklist due to a no-longer generated statistic.', emallson),
  change(date(2023, 1, 30), <>Updated <SpellLink spell={TALENTS.CALLING_THE_SHOTS_TALENT} /> to be 2.5 seconds per 50 focus as of 10.0.5.</>, Putro),
  change(date(2023, 1, 30), <>Added <SpellLink spell={TALENTS.DEATHBLOW_TALENT} /> tracking to <SpellLink spell={TALENTS.KILL_SHOT_SHARED_TALENT} /> module.</>, Putro),
  change(date(2023, 1, 30), <>Fixed an issue with <SpellLink spell={TALENTS.SERPENT_STING_TALENT}/> when combined with <SpellLink spell={TALENTS.SERPENTSTALKERS_TRICKERY_TALENT} /> resulting in incorrect warnings about refreshing.</>, Putro),
  change(date(2022, 12, 23), 'Enable Marksmanship for Dragonflight analysis', Putro),
  change(date(2022, 11, 11), 'Initial transition of Marksmanship to Dragonflight', [Arlie, Putro]),
];
