import {
  GrimoireOfSacrificeNormalizer,
  WarlockMissingDotApplyDebuffPrePull,
  GrimoireOfSacrifice,
} from 'analysis/retail/warlock/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Channeling from 'parser/shared/normalizers/Channeling';

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
import UnstableAfflictionUptime from './modules/spells/UnstableAffliction';
import { UnendingResolve, DarkPact, DemonicCircle } from '../shared';
import FoundationGuide from 'interface/guide/foundation/FoundationGuide';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizers
    channeling: Channeling,
    grimoireOfSacrificeNormalizer: GrimoireOfSacrificeNormalizer,
    warlockMissingDotApplyDebuffPrePull: WarlockMissingDotApplyDebuffPrePull,

    // Core
    globalCooldown: GlobalCooldown,

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    darkglare: Darkglare,

    // DoTs
    agonyUptime: AgonyUptime,
    corruptionUptime: CorruptionUptime,
    unstableAfflictionUptime: UnstableAfflictionUptime,
    dotUptimes: DotUptimes,

    // Resources
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,

    // Talents
    absoluteCorruption: AbsoluteCorruption,
    drainSoul: DrainSoul,
    grimoireOfSacrifice: GrimoireOfSacrifice,
    haunt: Haunt,
    nightfall: Nightfall,

    // Shared Spells
    unendingResolve: UnendingResolve,
    darkPact: DarkPact,
    demonicCircle: DemonicCircle,

    // Items

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
  static guide = FoundationGuide;
}

export default CombatLogParser;
