import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { Brandrewsss, MarchingCube, Myrx } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import TALENTS from 'common/TALENTS/deathknight';

export default [
  change(date(2026, 5, 29),  <>Added <SpellLink spell={TALENTS.SUDDEN_DOOM_TALENT} /> analysis for proc windows and cast tracking.</>, Myrx),
  change(date(2026, 5, 27), <>Improved Plague efficiency analysis.</>, Myrx),
  change(date(2026, 5, 23), <>Added analysis for <SpellLink spell={TALENTS.SCOURGE_STRIKE_TALENT} /> usage.</>, Myrx),
  change(date(2026, 5, 23), <>Added <SpellLink spell={TALENTS.SOUL_REAPER_TALENT} /> analysis and better cooldown tracking.</>, Myrx),
  change(date(2026, 5, 23), <>Added <SpellLink spell={TALENTS.FESTERING_SCYTHE_TALENT} /> analysis and added explanation and cast detail breakdown to guide.</>, Myrx),
  change(date(2026, 5, 23), <>Added Virulent Plague and Dread Plague uptime and explanation to the guide.</>, Myrx),  
  change(date(2026, 5, 15), <>Added analysis for <SpellLink spell={TALENTS.PUTREFY_TALENT} /> usage.</>, Myrx),
  change(date(2026, 4, 10), <>Added Active Time section to the guide with ability uptime, melee uptime, and downtime tracking.</>, MarchingCube),
  change(date(2026, 4, 2), <>Add <SpellLink spell={TALENTS.UNHOLY_AURA_TALENT} /> haste tracking per active Magus of the Dead.</>, MarchingCube),
  change(date(2026, 4, 2), <>Reworked <SpellLink spell={TALENTS.SUDDEN_DOOM_TALENT} /> tracking with stack support, fixed false overwrites from simultaneous procs, and fixed multi-stack expiration counting.</>, MarchingCube),
  change(date(2026, 3, 24), <>Fix <SpellLink spell={SPELLS.ANTI_MAGIC_SHELL} /> cooldown with <SpellLink spell={TALENTS.ANTI_MAGIC_BARRIER_TALENT} /> and <SpellLink spell={SPELLS.DEATH_CHARGE} /> charges with <SpellLink spell={TALENTS.DEATHS_ECHO_TALENT} />.</>, MarchingCube),
  change(date(2026, 3, 24), <>Add <SpellLink spell={SPELLS.NECROTIC_COIL} /> and <SpellLink spell={SPELLS.GRAVEYARD} /> spell definitions for <SpellLink spell={TALENTS.FORBIDDEN_KNOWLEDGE_1_UNHOLY_TALENT} />.</>, MarchingCube),
  change(date(2026, 2, 17), <>Updated <SpellLink spell={TALENTS.SUDDEN_DOOM_TALENT} /> efficiency and <SpellLink spell={TALENTS.COMMANDER_OF_THE_DEAD_TALENT} /> pet tracking. Added <SpellLink spell={SPELLS.LESSER_GHOUL_BUFF} /> stack tracking and <SpellLink spell={SPELLS.DREAD_PLAGUE} /> disease uptime.</>, Brandrewsss),
  change(date(2026, 2, 11), <>Added Cooldown Tracking and Throughput Tracker for <SpellLink spell={TALENTS.DARK_TRANSFORMATION_TALENT} />, <SpellLink spell={TALENTS.ARMY_OF_THE_DEAD_TALENT} />, and <SpellLink spell={TALENTS.PUTREFY_TALENT} />.</>, Brandrewsss),
  change(date(2026, 2, 5), <>Initial Update for Midnight.</>, Brandrewsss),
];
