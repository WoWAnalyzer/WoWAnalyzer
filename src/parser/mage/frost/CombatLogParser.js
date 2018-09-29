import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/core/modules/DamageDone';

import Checklist from './modules/Checklist/Module';

import Abilities from './modules/Features/Abilities';
import AlwaysBeCasting from './modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/Features/CooldownThroughputTracker';
import WintersChill from './modules/Features/WintersChill';
import BrainFreeze from './modules/Features/BrainFreeze';
import IceLance from './modules/Features/IceLance';
import ThermalVoid from './modules/Features/ThermalVoid';
import GlacialSpike from './modules/Features/GlacialSpike';
import BoneChilling from './modules/Features/BoneChilling';
import RuneOfPower from '../shared/modules/features/RuneOfPower';
import MirrorImage from '../shared/modules/features/MirrorImage';
import ArcaneIntellect from '../shared/modules/features/ArcaneIntellect';
import SplittingIce from './modules/Features/SplittingIce';
import CancelledCasts from '../shared/modules/features/CancelledCasts';
import WintersReach from './modules/Traits/WintersReach';
import Whiteout from './modules/Traits/Whiteout';
import FrozenOrb from './modules/Cooldowns/FrozenOrb';
import ColdSnap from './modules/Cooldowns/ColdSnap';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    checklist: Checklist,

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    cooldownThroughputTracker: CooldownThroughputTracker,
	  wintersChill: WintersChill,
	  brainFreeze: BrainFreeze,
    iceLance: IceLance,
	  thermalVoid: ThermalVoid,
	  glacialSpike: GlacialSpike,
    damageDone: [DamageDone, { showStatistic: true }],
    runeOfPower: RuneOfPower,
    mirrorImage: MirrorImage,
    arcaneIntellect: ArcaneIntellect,
    splittingIce: SplittingIce,
    boneChilling: BoneChilling,

    //Traits
    wintersReach: WintersReach,
    whiteout: Whiteout,

	  //Cooldowns
    frozenOrb: FrozenOrb,
    coldSnap: ColdSnap,
  };
}

export default CombatLogParser;
