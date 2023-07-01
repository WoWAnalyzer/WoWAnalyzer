import MainCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';

import Guide from './Guide';

import SandsOfTime from './modules/abilities/SandsOfTime';

import TimeSkip from './modules/talents/TimeSkip';
import Accretion from './modules/talents/Accretion';

import BuffTrackerGraph from './modules/features/BuffTrackerGraph';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    abilities: Abilities,
    buffs: Buffs,

    // Abilities
    sandsOfTime: SandsOfTime,

    // Talents
    timeSkip: TimeSkip,
    accretion: Accretion,

    // Features
    buffTrackerGraph: BuffTrackerGraph,
  };
  static guide = Guide;
}

export default CombatLogParser;
