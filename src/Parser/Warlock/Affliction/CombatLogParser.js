import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';

import AgonyUptime from './Modules/Features/AgonyUptime';
import CorruptionUptime from './Modules/Features/CorruptionUptime';
import UABuffTracker from './Modules/Features/UABuffTracker';

import SoulShardTracker from './Modules/SoulShards/SoulShardTracker';
import SoulShardDetails from './Modules/SoulShards/SoulShardDetails';
import FatalEchoes from './Modules/Features/FatalEchoes';
import Sniping from './Modules/Features/Sniping';
import WastedDeadwindHarvester from './Modules/Features/WastedDeadwindHarvester';

import Haunt from './Modules/Talents/Haunt';
import MaleficGrasp from './Modules/Talents/MaleficGrasp';
import Contagion from './Modules/Talents/Contagion';
import AbsoluteCorruption from './Modules/Talents/AbsoluteCorruption';
import EmpoweredLifeTap from './Modules/Talents/EmpoweredLifeTap';
import SoulHarvest from './Modules/Talents/SoulHarvest';
import SoulHarvestTalent from './Modules/Talents/SoulHarvestTalent';
import DeathsEmbrace from './Modules/Talents/DeathsEmbrace';
import SiphonLifeUptime from './Modules/Talents/SiphonLifeUptime';

import TheMasterHarvester from './Modules/Items/Legendaries/TheMasterHarvester';
import StretensSleeplessShackles from './Modules/Items/Legendaries/StretensSleeplessShackles';
import SoulOfTheNetherlord from './Modules/Items/Legendaries/SoulOfTheNetherlord';
import PowerCordOfLethtendris from './Modules/Items/Legendaries/PowerCordOfLethtendris';
import SacrolashsDarkStrike from './Modules/Items/Legendaries/SacrolashsDarkStrike';
import ReapAndSow from './Modules/Items/Legendaries/ReapAndSow';

import Tier20_2set from './Modules/Items/Tier20_2set';
import Tier20_4set from './Modules/Items/Tier20_4set';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    damageDone: [DamageDone, { showStatistic: true }],
    fatalEchoes: FatalEchoes,
    sniping: Sniping,
    wastedDeadwindHarvester: WastedDeadwindHarvester,

    // DoTs
    agonyUptime: AgonyUptime,
    corruptionUptime: CorruptionUptime,
    uaBuffTracker: UABuffTracker,

    // Core
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,

    // Talents
    haunt: Haunt,
    maleficGrasp: MaleficGrasp,
    contagion: Contagion,
    absoluteCorruption: AbsoluteCorruption,
    empoweredLifeTap: EmpoweredLifeTap,
    soulHarvest: SoulHarvest,
    soulHarvestTalent: SoulHarvestTalent,
    deathsEmbrace: DeathsEmbrace,
    siphonLifeUptime: SiphonLifeUptime,

    // Legendaries
    masterHarvester: TheMasterHarvester,
    stretensSleeplessShackles: StretensSleeplessShackles,
    soulOfTheNetherlord: SoulOfTheNetherlord,
    powerCordOfLethtendris: PowerCordOfLethtendris,
    sacrolashsDarkStrike: SacrolashsDarkStrike,
    reapAndSow: ReapAndSow,

    // Items
    tier20_2set: Tier20_2set,
    tier20_4set: Tier20_4set,
  };
}

export default CombatLogParser;
