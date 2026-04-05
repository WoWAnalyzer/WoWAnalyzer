import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { Brandrewsss, MarchingCube } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import TALENTS from 'common/TALENTS/deathknight';

export default [
  change(date(2026, 4, 2), <>Reworked <SpellLink spell={TALENTS.SUDDEN_DOOM_TALENT} /> tracking with stack support, fixed false overwrites from simultaneous procs, and fixed multi-stack expiration counting.</>, MarchingCube),
  change(date(2026, 3, 24), <>Fix <SpellLink spell={SPELLS.ANTI_MAGIC_SHELL} /> cooldown with <SpellLink spell={TALENTS.ANTI_MAGIC_BARRIER_TALENT} /> and <SpellLink spell={SPELLS.DEATH_CHARGE} /> charges with <SpellLink spell={TALENTS.DEATHS_ECHO_TALENT} />.</>, MarchingCube),
  change(date(2026, 3, 24), <>Add <SpellLink spell={SPELLS.NECROTIC_COIL} /> and <SpellLink spell={SPELLS.GRAVEYARD} /> spell definitions for <SpellLink spell={TALENTS.FORBIDDEN_KNOWLEDGE_1_UNHOLY_TALENT} />.</>, MarchingCube),
  change(date(2026, 2, 17), <>Updated <SpellLink spell={TALENTS.SUDDEN_DOOM_TALENT} /> efficiency and <SpellLink spell={TALENTS.COMMANDER_OF_THE_DEAD_TALENT} /> pet tracking. Added <SpellLink spell={SPELLS.LESSER_GHOUL_BUFF} /> stack tracking and <SpellLink spell={SPELLS.DREAD_PLAGUE} /> disease uptime.</>, Brandrewsss),
  change(date(2026, 2, 11), <>Added Cooldown Tracking and Throughput Tracker for <SpellLink spell={TALENTS.DARK_TRANSFORMATION_TALENT} />, <SpellLink spell={TALENTS.ARMY_OF_THE_DEAD_TALENT} />, and <SpellLink spell={TALENTS.PUTREFY_TALENT} />.</>, Brandrewsss),
  change(date(2026, 2, 5), <>Initial Update for Midnight.</>, Brandrewsss),
];
