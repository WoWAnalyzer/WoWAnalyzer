import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownTracker from './Modules/Features/CooldownTracker';
import WintersChillTracker from './Modules/Features/WintersChill';
import BrainFreeze from './Modules/Features/BrainFreeze';
import IceLance from './Modules/Features/IceLance';
import ThermalVoid from './Modules/Features/ThermalVoid';
import IcicleTracker from './Modules/Features/IcicleTracker';
import ArcticGale from './Modules/Features/ArcticGale';
import FrostBomb from './Modules/Features/FrostBomb';
import RuneOfPower from '../Shared/Modules/Features/RuneOfPower';
import MirrorImage from '../Shared/Modules/Features/MirrorImage';
import UnstableMagic from '../Shared/Modules/Features/UnstableMagic';
import SplittingIce from './Modules/Features/SplittingIce';

import FrozenOrb from './Modules/Cooldowns/FrozenOrb';
import IcyVeins from './Modules/Cooldowns/IcyVeins';

import ShardOfTheExodar from '../Shared/Modules/Items/ShardOfTheExodar';
import Tier20_2set from './Modules/Items/Tier20_2set';
import ZannesuJourney from './Modules/Items/ZannesuJourney';
import MagtheridonsBanishedBracers from './Modules/Items/MagtheridonsBanishedBracers';
import ShatteredFragmentsOfSindragosa from './Modules/Items/ShatteredFragmentsOfSindragosa';
import SoulOfTheArchmage from './Modules/Items/SoulOfTheArchmage';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,
	  wintersChillTracker: WintersChillTracker,
	  brainFreeze: BrainFreeze,
    iceLance: IceLance,
	  thermalVoid: ThermalVoid,
	  icicleTracker: IcicleTracker,
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
	  tier20_2set: Tier20_2set,
	  shardOfTheExodar: ShardOfTheExodar,
    zannesuJourney: ZannesuJourney,
    magtheridonsBanishedBracers: MagtheridonsBanishedBracers,
    shatteredFragmentsOfSindragosa: ShatteredFragmentsOfSindragosa,
    soulOfTheArchmage: SoulOfTheArchmage,
  };
}

export default CombatLogParser;
