import {
  GrimoireOfSacrificeNormalizer,
  WarlockMissingDotApplyDebuffPrePull,
  GrimoireOfSacrifice,
} from 'analysis/retail/warlock/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Channeling from 'parser/shared/normalizers/Channeling';
import GlobalCooldown from './modules/core/GlobalCooldown';
import Abilities from './modules/core/Abilities';
import AlwaysBeCasting from './modules/core/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/core/CooldownThroughputTracker';
import Darkglare from './modules/analyzers/Darkglare';
import SoulShardDetails from '../shared/resources/SoulShardDetails';
import SoulShardTracker from '../shared/resources/SoulShardTracker';
import SoulShardGraph from '../shared/resources/SoulShardGraph';
import AbsoluteCorruption from './modules/analyzers/AbsoluteCorruption';
import Agony from './modules/analyzers/Agony';
import Corruption from './modules/analyzers/Corruption';
import CorruptionUptime from './modules/guide/CorruptionUptime';
import UnstableAffliction from './modules/analyzers/UnstableAffliction';
import UnstableAfflictionCasts from './modules/analyzers/UnstableAfflictionEfficiency';
import DrainSoul from './modules/analyzers/DrainSoul';
import Haunt from './modules/analyzers/Haunt';
import Nightfall from './modules/analyzers/Nightfall';
import { UnendingResolve, DarkPact, DemonicCircle } from '../shared';
import Guide from './Guide';

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
    agony: Agony,
    corruption: Corruption,
    corruptionUptime: CorruptionUptime,
    unstableaffliction: UnstableAffliction,
    unstableafflictionCasts: UnstableAfflictionCasts,

    // Resources
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,
    soulshardGraph: SoulShardGraph,

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
  static guide = Guide;
}

export default CombatLogParser;
