import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import {
  GrimoireOfSacrificeNormalizer,
  WarlockMissingDotApplyDebuffPrePull,
  GrimoireOfSacrifice,
} from '@wowanalyzer/warlock';

import Channeling from './modules/core/Channeling';
import GlobalCooldown from './modules/core/GlobalCooldown';
import ScouringTitheUptime from './modules/covenants/ScouringTithe';
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/Checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Darkglare from './modules/features/Darkglare';
import DotUptimes from './modules/features/DotUptimes';
import AgonyUptime from './modules/features/DotUptimes/AgonyUptime';
import CorruptionUptime from './modules/features/DotUptimes/CorruptionUptime';
import UnstableAfflictionUptime from './modules/features/DotUptimes/UnstableAfflictionUptime';
import ShadowEmbrace from './modules/features/ShadowEmbrace';
import SoulShardDetails from './modules/soulshards/SoulShardDetails';
import SoulShardTracker from './modules/soulshards/SoulShardTracker';
import AbsoluteCorruption from './modules/talents/AbsoluteCorruption';
import DrainSoul from './modules/talents/DrainSoul';
import Haunt from './modules/talents/Haunt';
import Nightfall from './modules/talents/Nightfall';
import PhantomSingularity from './modules/talents/PhantomSingularity';
import SiphonLifeUptime from './modules/talents/SiphonLifeUptime';
import SoulConduit from './modules/talents/SoulConduit';
import VileTaint from './modules/talents/VileTaint';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    darkglare: Darkglare,
    shadowEmbrace: ShadowEmbrace,

    // Normalizers
    grimoireOfSacrificeNormalizer: GrimoireOfSacrificeNormalizer,
    warlockMissingDotApplyDebuffPrePull: WarlockMissingDotApplyDebuffPrePull,

    // DoTs
    agonyUptime: AgonyUptime,
    corruptionUptime: CorruptionUptime,
    unstableAfflictionUptime: UnstableAfflictionUptime,
    dotUptimes: DotUptimes,

    // Core
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,
    channeling: Channeling,
    globalCooldown: GlobalCooldown,

    // Talents
    nightfall: Nightfall,
    drainSoul: DrainSoul,
    absoluteCorruption: AbsoluteCorruption,
    siphonLifeUptime: SiphonLifeUptime,
    phantomSingularity: PhantomSingularity,
    vileTaint: VileTaint,
    haunt: Haunt,
    grimoireOfSacrifice: GrimoireOfSacrifice,
    soulConduit: SoulConduit,

    // Covenants
    scouringTithe: ScouringTitheUptime,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
}

export default CombatLogParser;
