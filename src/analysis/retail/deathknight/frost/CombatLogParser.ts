import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import { RuneDetails, RuneOfTheFallenCrusader } from 'analysis/retail/deathknight/shared/';
import Guide from './Guide';
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import FrostFeverUptime from './modules/features/FrostFeverUptime';
import HardHowlingBlastCasts from './modules/features/HardHowlingBlastCasts';
import KillingMachineEfficiency from './modules/features/KillingMachine';
import RimeEfficiency from './modules/features/RimeEfficiency';
import FrostRuneForgeChecker from './modules/features/RuneForgeChecker';
import RuneGraph from './modules/features/RuneGraph';
import RuneTracker from './modules/features/RuneTracker';
import SpellUsable from './modules/features/SpellUsable';
import RunicPowerDetails from './modules/runicpower/RunicPowerDetails';
import RunicPowerGraph from './modules/runicpower/RunicPowerGraph';
import RunicPowerTracker from './modules/runicpower/RunicPowerTracker';
import BreathOfSindragosa from './modules/talents/BreathOfSindragosa';
import Frostscythe from './modules/talents/Frostscythe';
import GatheringStorm from './modules/talents/GatheringStorm';
import HornOfWinter from './modules/talents/HornOfWinter';
import EmpowerRuneWeapon from './modules/talents/EmpowerRuneWeapon';
import SoulReaper from '../shared/talents/SoulReaper';
import ExterminateCostNormalizer from '../shared/ExterminateCostNormalizer';

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
    runeGraph: RuneGraph,
    runicPowerDetails: RunicPowerDetails,
    runicPowerTracker: RunicPowerTracker,
    runicPowerGraph: RunicPowerGraph,

    //talents
    gatheringStorm: GatheringStorm,
    frostscythe: Frostscythe,
    hornOfWinter: HornOfWinter,
    empowerRuneWeapon: EmpowerRuneWeapon,
    soulReaper: SoulReaper,

    //hero talents
    ExterminateCostNormalizer,

    // Runes
    runeOfTheFallenCrusader: RuneOfTheFallenCrusader,

    arcaneTorrent: [ArcaneTorrent, { castEfficiency: 0.5 }] as const,
  };

  static guide = Guide;
}

export default CombatLogParser;
