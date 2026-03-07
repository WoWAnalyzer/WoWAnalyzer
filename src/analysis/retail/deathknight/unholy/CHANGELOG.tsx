import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { Brandrewsss } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import TALENTS from 'common/TALENTS/deathknight';

export default [
  change(date(2026, 2, 17), <>Updated <SpellLink spell={TALENTS.SUDDEN_DOOM_TALENT} /> efficiency and <SpellLink spell={TALENTS.COMMANDER_OF_THE_DEAD_TALENT} /> pet tracking. Added <SpellLink spell={SPELLS.LESSER_GHOUL_BUFF} /> stack tracking and <SpellLink spell={SPELLS.DREAD_PLAGUE} /> disease uptime.</>, Brandrewsss),
  change(date(2026, 2, 11), <>Added Cooldown Tracking and Throughput Tracker for <SpellLink spell={TALENTS.DARK_TRANSFORMATION_TALENT} />, <SpellLink spell={TALENTS.ARMY_OF_THE_DEAD_TALENT} />, and <SpellLink spell={TALENTS.PUTREFY_TALENT} />.</>, Brandrewsss),
  change(date(2026, 2, 5), <>Initial Update for Midnight.</>, Brandrewsss),
];
