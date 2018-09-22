import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Checklist from './Modules/Checklist/Module';

import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import WintersChill from './Modules/Features/WintersChill';
import BrainFreeze from './Modules/Features/BrainFreeze';
import IceLance from './Modules/Features/IceLance';
import ThermalVoid from './Modules/Features/ThermalVoid';
import GlacialSpike from './Modules/Features/GlacialSpike';
import BoneChilling from './Modules/Features/BoneChilling';
import RuneOfPower from '../Shared/Modules/Features/RuneOfPower';
import MirrorImage from '../Shared/Modules/Features/MirrorImage';
import ArcaneIntellect from '../Shared/Modules/Features/ArcaneIntellect';
import SplittingIce from './Modules/Features/SplittingIce';
import CancelledCasts from '../Shared/Modules/Features/CancelledCasts';
import WintersReach from './Modules/Traits/WintersReach';
import Whiteout from './Modules/Traits/Whiteout';
import FrozenOrb from './Modules/Cooldowns/FrozenOrb';
import ColdSnap from './Modules/Cooldowns/ColdSnap';

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
