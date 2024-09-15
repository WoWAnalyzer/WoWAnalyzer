import { GrimoireOfSacrificeNormalizer, GrimoireOfSacrifice } from 'analysis/retail/warlock/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import SpellUsable from './modules/core/SpellUsable';
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Backdraft from './modules/talents/Backdraft';
import Checklist from './modules/features/Checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Havoc from './modules/talents/Havoc';
import ImmolateUptime from './modules/features/ImmolateUptime';
import RainOfFire from './modules/features/RainOfFire';
import SoulShardDetails from './modules/soulshards/SoulShardDetails';
import SoulShardTracker from './modules/soulshards/SoulShardTracker';
import Cataclysm from './modules/talents/Cataclysm';
import ChannelDemonfire from './modules/talents/ChannelDemonfire';
import Eradication from './modules/talents/Eradication';
import FireAndBrimstone from './modules/talents/FireAndBrimstone';
import Flashover from './modules/talents/Flashover';
import Inferno from './modules/talents/Inferno';
import InternalCombustion from './modules/talents/InternalCombustion';
import ReverseEntropy from './modules/talents/ReverseEntropy';
import RoaringBlaze from './modules/talents/RoaringBlaze';
import RollingHavoc from './modules/talents/RollingHavoc';
import Shadowburn from './modules/talents/Shadowburn';
import SoulConduit from './modules/talents/SoulConduit';
import SoulFire from './modules/talents/SoulFire';
import FlashPoint from './modules/talents/FlashPoint';
import BurnToAshes from './modules/talents/BurnToAshes';
import { UnendingResolve, DarkPact, DemonicCircle } from '../shared';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,

    // DoTs
    immolateUptime: ImmolateUptime,

    // Core
    havoc: Havoc,
    backdraft: Backdraft,
    rainOfFire: RainOfFire,
    checklist: Checklist,
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,
    spellUsable: SpellUsable,

    grimoireOfSacrificeNormalizer: GrimoireOfSacrificeNormalizer,

    // Talents
    flashover: Flashover,
    eradication: Eradication,
    soulFire: SoulFire,
    reverseEntropy: ReverseEntropy,
    internalCombustion: InternalCombustion,
    shadowburn: Shadowburn,
    inferno: Inferno,
    fireAndBrimstone: FireAndBrimstone,
    cataclysm: Cataclysm,
    roaringBlaze: RoaringBlaze,
    grimoireOfSacrifice: GrimoireOfSacrifice,
    soulConduit: SoulConduit,
    channelDemonfire: ChannelDemonfire,
    rollingHavoc: RollingHavoc,
    flashPoint: FlashPoint,
    burnToAshes: BurnToAshes,

    // Shared Spells
    unendingResolve: UnendingResolve,
    darkPact: DarkPact,
    demonicCircle: DemonicCircle,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
}

export default CombatLogParser;
