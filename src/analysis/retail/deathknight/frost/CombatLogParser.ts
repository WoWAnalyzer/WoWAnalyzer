import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import { RuneDetails, RuneOfTheFallenCrusader } from 'analysis/retail/deathknight/shared/';
import Guide from './Guide';
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import FrostFeverUptime from './modules/features/FrostFeverUptime';
import HardHowlingBlastCasts from './modules/features/HardHowlingBlastCasts';
import KillingMachineEfficiency from './modules/features/KillingMachine';
import RimeEfficiency from './modules/features/RimeEfficiency';
import FrostRuneForgeChecker from './modules/features/RuneForgeChecker';
import RuneGraph from './modules/features/RuneGraph';
import RuneTracker from './modules/features/RuneTracker';
import RunicPowerDetails from './modules/runicpower/RunicPowerDetails';
import RunicPowerGraph from './modules/runicpower/RunicPowerGraph';
import RunicPowerTracker from './modules/runicpower/RunicPowerTracker';
import BreathOfSindragosa from './modules/talents/BreathOfSindragosa';
import Frostscythe from './modules/talents/Frostscythe';
import EmpowerRuneWeapon from './modules/talents/EmpowerRuneWeapon';
import ExterminateCostNormalizer from '../shared/ExterminateCostNormalizer';
import AplCheck from './modules/apl/AplCheck';
import FrostOpener from './modules/apl/Opener';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    runeforgeChecker: FrostRuneForgeChecker,
    aplCheck: AplCheck,
    frostOpener: FrostOpener,

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
    frostscythe: Frostscythe,
    empowerRuneWeapon: EmpowerRuneWeapon,

    //hero talents
    ExterminateCostNormalizer,

    // Runes
    runeOfTheFallenCrusader: RuneOfTheFallenCrusader,

    arcaneTorrent: [ArcaneTorrent, { castEfficiency: 0.5 }] as const,
  };

  static guide = Guide;
}

export default CombatLogParser;
