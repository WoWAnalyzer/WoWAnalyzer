import { change, date } from 'common/changelog';
import { Arlie, emallson, Putro } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/hunter';
export default [
  change(date(2023, 1, 30), 'Fixed a crashing bug in the Checklist due to a no-longer generated statistic.', emallson),
  change(date(2023, 1, 30), <>Updated <SpellLink id={TALENTS.CALLING_THE_SHOTS_TALENT.id} /> to be 2.5 seconds per 50 focus as of 10.0.5.</>, Putro),
  change(date(2023, 1, 30), <>Added <SpellLink id={TALENTS.DEATHBLOW_TALENT.id} /> tracking to <SpellLink id={TALENTS.KILL_SHOT_SHARED_TALENT.id} /> module.</>, Putro),
  change(date(2023, 1, 30), <>Fixed an issue with <SpellLink id={TALENTS.SERPENT_STING_TALENT.id}/> when combined with <SpellLink id={TALENTS.SERPENTSTALKERS_TRICKERY_TALENT.id} /> resulting in incorrect warnings about refreshing.</>, Putro),
  change(date(2022, 12, 23), 'Enable Marksmanship for Dragonflight analysis', Putro),
  change(date(2022, 11, 11), 'Initial transition of Marksmanship to Dragonflight', [Arlie, Putro]),
];
