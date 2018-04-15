import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import SpellUsable from './Modules/Features/SpellUsable';
import Checklist from './Modules/Features/Checklist';

import FrostFeverUptime from './Modules/Features/FrostFeverUptime';
import WastedRimeProcs from './Modules/Features/WastedRimeProcs';
import HardHowlingBlastCasts from './Modules/Features/HardHowlingBlastCasts';

import RuneTracker from './Modules/Features/RuneTracker';
import RuneDetails from '../Shared/RuneDetails';
import RunicPowerDetails from './Modules/RunicPower/RunicPowerDetails';
import RunicPowerTracker from './Modules/RunicPower/RunicPowerTracker';

import GatheringStorm from './Modules/Talents/GatheringStorm';
import Frostscythe from './Modules/Talents/Frostscythe';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    damageDone: [DamageDone, { showStatistic: true }],
    cooldownThroughputTracker: CooldownThroughputTracker,
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    spellUsable: SpellUsable,
    checklist: Checklist,

    // Features
    HardHowlingBlastCasts: HardHowlingBlastCasts,
    frostfeverUptime: FrostFeverUptime,
    WastedRimeProcs: WastedRimeProcs,

    //resource tracker
    runeTracker: RuneTracker,
    runeDetails: RuneDetails,
    runicPowerDetails: RunicPowerDetails,
    runicPowerTracker: RunicPowerTracker,

    //talents
    gatheringStorm: GatheringStorm,
    frostscythe: Frostscythe,
  };
}

export default CombatLogParser;
