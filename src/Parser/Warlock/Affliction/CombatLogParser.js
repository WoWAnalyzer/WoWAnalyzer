import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';

import AgonyUptime from './Modules/Features/AgonyUptime';
import CorruptionUptime from './Modules/Features/CorruptionUptime';
import ReapBuffTracker from './Modules/Features/ReapBuffTracker';

import SoulShardTracker from './Modules/SoulShards/SoulShardTracker';
import SoulShardDetails from './Modules/SoulShards/SoulShardDetails';
import Channeling from './Modules/WarlockCore/Channeling';
import GlobalCooldown from './Modules/WarlockCore/GlobalCooldown';
import FatalEchoes from './Modules/Features/FatalEchoes';
import Sniping from './Modules/Features/Sniping';
import TormentedSouls from './Modules/Features/TormentedSouls';

import Haunt from './Modules/Talents/Haunt';
import MaleficGrasp from './Modules/Talents/MaleficGrasp';
import Contagion from './Modules/Talents/Contagion';
import AbsoluteCorruption from './Modules/Talents/AbsoluteCorruption';
import EmpoweredLifeTap from './Modules/Talents/EmpoweredLifeTap';
import SoulHarvest from '../Shared/Modules/Talents/SoulHarvest';
import SoulHarvestTalent from '../Shared/Modules/Talents/SoulHarvestTalent';
import DeathsEmbrace from './Modules/Talents/DeathsEmbrace';
import SiphonLifeUptime from './Modules/Talents/SiphonLifeUptime';
import SoulConduit from './Modules/Talents/SoulConduit';

import TheMasterHarvester from '../Shared/Modules/Items/TheMasterHarvester';
import StretensSleeplessShackles from './Modules/Items/Legendaries/StretensSleeplessShackles';
import SoulOfTheNetherlord from './Modules/Items/Legendaries/SoulOfTheNetherlord';
import PowerCordOfLethtendris from './Modules/Items/Legendaries/PowerCordOfLethtendris';
import SacrolashsDarkStrike from './Modules/Items/Legendaries/SacrolashsDarkStrike';
import ReapAndSow from './Modules/Items/Legendaries/ReapAndSow';

import Tier20_2set from './Modules/Items/Tier20_2set';
import Tier20_4set from './Modules/Items/Tier20_4set';
import Tier21_2set from './Modules/Items/Tier21_2set';
import Tier21_4set from './Modules/Items/Tier21_4set';

import Checklist from './Modules/Features/Checklist';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    damageDone: [DamageDone, { showStatistic: true }],
    fatalEchoes: FatalEchoes,
    sniping: Sniping,
    tormentedSouls: TormentedSouls,
    checklist: Checklist,

    // DoTs
    agonyUptime: AgonyUptime,
    corruptionUptime: CorruptionUptime,
    reapBuffTracker: ReapBuffTracker,

    // Core
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,
    channeling: Channeling,
    globalCooldown: GlobalCooldown,

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
    soulConduit: SoulConduit,

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
    tier21_2set: Tier21_2set,
    tier21_4set: Tier21_4set,
  };
}

export default CombatLogParser;
