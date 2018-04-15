import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Checklist from './Modules/Features/Checklist';

import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import WintersChillTracker from './Modules/Features/WintersChill';
import BrainFreeze from './Modules/Features/BrainFreeze';
import IceLance from './Modules/Features/IceLance';
import ThermalVoid from './Modules/Features/ThermalVoid';
import GlacialSpike from './Modules/Features/GlacialSpike';
import ArcticGale from './Modules/Features/ArcticGale';
import FrostBomb from './Modules/Features/FrostBomb';
import RuneOfPower from '../Shared/Modules/Features/RuneOfPower';
import MirrorImage from '../Shared/Modules/Features/MirrorImage';
import UnstableMagic from '../Shared/Modules/Features/UnstableMagic';
import SplittingIce from './Modules/Features/SplittingIce';
import CancelledCasts from '../Shared/Modules/Features/CancelledCasts';

import FrozenOrb from './Modules/Cooldowns/FrozenOrb';
import IcyVeins from './Modules/Cooldowns/IcyVeins';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    checklist: Checklist,

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    cooldownThroughputTracker: CooldownThroughputTracker,
    wintersChillTracker: WintersChillTracker,
    brainFreeze: BrainFreeze,
    iceLance: IceLance,
    thermalVoid: ThermalVoid,
    glacialSpike: GlacialSpike,
    damageDone: [DamageDone, { showStatistic: true }],
    runeOfPower: RuneOfPower,
    mirrorImage: MirrorImage,
    unstableMagic: UnstableMagic,
    arcticGale: ArcticGale,
    frostBomb: FrostBomb,
    splittingIce: SplittingIce,

    //Cooldowns
    frozenOrb: FrozenOrb,
    icyVeins: IcyVeins,

    //Items
  };
}

export default CombatLogParser;
