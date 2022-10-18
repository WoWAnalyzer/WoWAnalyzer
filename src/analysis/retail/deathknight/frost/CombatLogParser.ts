import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import { RuneDetails, RuneOfHysteria, RuneOfTheFallenCrusader } from '../shared';
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import FrostFeverUptime from './modules/features/FrostFeverUptime';
import HardHowlingBlastCasts from './modules/features/HardHowlingBlastCasts';
import KillingMachineEfficiency from './modules/features/KillingMachine';
import RimeEfficiency from './modules/features/RimeEfficiency';
import FrostRuneForgeChecker from './modules/features/RuneForgeChecker';
import RuneTracker from './modules/features/RuneTracker';
import SpellUsable from './modules/features/SpellUsable';
import RunicPowerDetails from './modules/runicpower/RunicPowerDetails';
import RunicPowerTracker from './modules/runicpower/RunicPowerTracker';
import BreathOfSindragosa from './modules/talents/BreathOfSindragosa';
import Frostscythe from './modules/talents/Frostscythe';
import GatheringStorm from './modules/talents/GatheringStorm';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    spellUsable: SpellUsable,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    runeforgeChecker: FrostRuneForgeChecker,

    // Features
    HardHowlingBlastCasts: HardHowlingBlastCasts,
    frostfeverUptime: FrostFeverUptime,
    rimeEfficiency: RimeEfficiency,
    killingMachineEfficiency: KillingMachineEfficiency,
    breathofSindragoa: BreathOfSindragosa,

    //resource tracker
    runeTracker: RuneTracker,
    runeDetails: RuneDetails,
    runicPowerDetails: RunicPowerDetails,
    runicPowerTracker: RunicPowerTracker,

    //talents
    gatheringStorm: GatheringStorm,
    frostscythe: Frostscythe,

    // Runes
    runeOfTheFallenCrusader: RuneOfTheFallenCrusader,
    runeOfHysteria: RuneOfHysteria,

    arcaneTorrent: [ArcaneTorrent, { castEfficiency: 0.5 }] as const,
  };
}

export default CombatLogParser;
