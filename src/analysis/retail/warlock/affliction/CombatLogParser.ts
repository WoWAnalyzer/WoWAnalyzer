import {
  GrimoireOfSacrificeNormalizer,
  WarlockMissingDotApplyDebuffPrePull,
  GrimoireOfSacrifice,
  DemonicCirclesCreated,
} from 'analysis/retail/warlock/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Channeling from 'parser/shared/normalizers/Channeling';

import Checklist from './modules/checklist/Module';
import GlobalCooldown from './modules/core/GlobalCooldown';
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Darkglare from './modules/features/Darkglare';
import DotUptimes from './modules/features/DotUptimes';
import SoulShardDetails from './modules/resources/SoulShardDetails';
import SoulShardTracker from './modules/resources/SoulShardTracker';
import AbsoluteCorruption from './modules/spells/AbsoluteCorruption';
import AgonyUptime from './modules/spells/Agony';
import CorruptionUptime from './modules/spells/Corruption';
import DrainSoul from './modules/spells/DrainSoul';
import Haunt from './modules/spells/Haunt';
import Nightfall from './modules/spells/Nightfall';
import PhantomSingularity from './modules/spells/PhantomSingularity';
import ShadowEmbrace from './modules/spells/ShadowEmbrace';
import SiphonLifeUptime from './modules/spells/SiphonLife';
import SoulConduit from './modules/spells/SoulConduit';
import UnstableAfflictionUptime from './modules/spells/UnstableAffliction';
import VileTaint from './modules/spells/VileTaint';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    darkglare: Darkglare,
    shadowEmbrace: ShadowEmbrace,
    demonicCirclesCreated: DemonicCirclesCreated,

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

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
}

export default CombatLogParser;
