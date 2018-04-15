import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import LowMana from './Modules/Features/LowMana';
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
    lowMana: LowMana,
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
  };
}

export default CombatLogParser;
