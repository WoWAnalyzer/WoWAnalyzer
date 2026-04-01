import { GrimoireOfSacrificeNormalizer, GrimoireOfSacrifice } from 'analysis/retail/warlock/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Guide from './Guide';
import SpellUsable from './modules/core/SpellUsable';
import Abilities from './modules/core/Abilities';
import AlwaysBeCasting from './modules/core/AlwaysBeCasting';
import Backdraft from './modules/analyzers/Backdraft';
import CooldownThroughputTracker from './modules/core/CooldownThroughputTracker';
import Havoc from './modules/analyzers/Havoc';
import ImmolateUptime from './modules/guide/ImmolateUptime';
import RainOfFire from './modules/analyzers/RainOfFire';
import SoulShardDetails from '../shared/resources/SoulShardDetails';
import SoulShardTracker from '../shared/resources/SoulShardTracker';
import SoulShardGraph from '../shared/resources/SoulShardGraph';
import Cataclysm from './modules/analyzers/Cataclysm';
import ChannelDemonfire from './modules/analyzers/ChannelDemonfire';
import FireAndBrimstone from './modules/analyzers/FireAndBrimstone';
import InternalCombustion from './modules/analyzers/InternalCombustion';
import ReverseEntropy from './modules/analyzers/ReverseEntropy';
import Shadowburn from './modules/analyzers/Shadowburn';
import SoulFire from './modules/analyzers/SoulFire';
import FlashPoint from './modules/analyzers/FlashPoint';
import { UnendingResolve, DarkPact, DemonicCircle, DemonicHealthstone } from '../shared';
import Immolate from './modules/analyzers/Immolate';
import HavocAnalyzer from './modules/analyzers/HavocAnalyzer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    havocAnalyzer: HavocAnalyzer,

    // DoTs
    immolate: Immolate,
    immolateUptime: ImmolateUptime,

    // Core
    havoc: Havoc,
    backdraft: Backdraft,
    rainOfFire: RainOfFire,
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,
    soulShardGraph: SoulShardGraph,
    spellUsable: SpellUsable,

    grimoireOfSacrificeNormalizer: GrimoireOfSacrificeNormalizer,

    // Talents
    soulFire: SoulFire,
    reverseEntropy: ReverseEntropy,
    internalCombustion: InternalCombustion,
    shadowburn: Shadowburn,
    fireAndBrimstone: FireAndBrimstone,
    cataclysm: Cataclysm,
    grimoireOfSacrifice: GrimoireOfSacrifice,
    channelDemonfire: ChannelDemonfire,
    flashPoint: FlashPoint,

    // Shared Spells
    unendingResolve: UnendingResolve,
    darkPact: DarkPact,
    demonicCircle: DemonicCircle,
    demonicHealthstone: DemonicHealthstone,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
  static guide = Guide;
}

export default CombatLogParser;
