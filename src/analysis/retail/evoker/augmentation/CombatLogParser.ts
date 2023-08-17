import MainCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';

import Guide from './Guide';

import SandsOfTime from './modules/abilities/SandsOfTime';
//import BreathOfEons from './modules/abilities/BreathOfEon';
import EbonMight from './modules/abilities/EbonMight';
import ShiftingSands from './modules/abilities/ShiftingSands';
import BreathOfEonsRotational from './modules/breahtofeons/BreathOfEonsRotational';

import TimeSkip from './modules/talents/TimeSkip';
import Accretion from './modules/talents/Accretion';
import Prescience from './modules/talents/Prescience';
import Anachronism from './modules/talents/Anachronism';

import BuffTrackerGraph from './modules/features/BuffTrackerGraph';
import BlisteringScalesGraph from './modules/talents/BlisteringScalesGraph';
import BlisteringScalesStackTracker from './modules/talents/BlisteringScalesStackTracker';

import PrescienceNormalizer from './modules/normalizers/PrescienceNormalizer';
import CastLinkNormalizer from './modules/normalizers/CastLinkNormalizer';
import EmpowerNormalizer from './modules/normalizers/EmpowerNormalizer';
import EbonMightNormalizer from './modules/normalizers/EbonMightNormalizer';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    // Normalizers
    castLinkNormalizer: CastLinkNormalizer,
    prescienceNormalizer: PrescienceNormalizer,
    empowerNormalizer: EmpowerNormalizer,
    ebonMightNormalizer: EbonMightNormalizer,

    // Core
    abilities: Abilities,
    buffs: Buffs,

    // Abilities
    sandsOfTime: SandsOfTime,
    //breathOfEons: BreathOfEons,
    breathOfEonsRotational: BreathOfEonsRotational,
    ebonMight: EbonMight,
    shiftingSands: ShiftingSands,

    // Talents
    timeSkip: TimeSkip,
    accretion: Accretion,
    blisteringScalesGraph: BlisteringScalesGraph,
    blisteringScalesStackTracker: BlisteringScalesStackTracker,
    prescience: Prescience,
    anachronism: Anachronism,

    // Features
    buffTrackerGraph: BuffTrackerGraph,
  };
  static guide = Guide;
}

export default CombatLogParser;
