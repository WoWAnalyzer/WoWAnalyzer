import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/shared/modules/DamageDone';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import ImmolateUptime from './modules/features/ImmolateUptime';
import Havoc from './modules/features/Havoc';
import Checklist from './modules/features/Checklist/Module';

import SoulShardTracker from './modules/soulshards/SoulShardTracker';
import SoulShardDetails from './modules/soulshards/SoulShardDetails';

import GrimoireOfSacrificeNormalizer from '../shared/modules/talents/normalizers/GrimoireOfSacrificeNormalizer';

import Backdraft from './modules/features/Backdraft';
import Eradication from './modules/talents/Eradication';
import ReverseEntropy from './modules/talents/ReverseEntropy';
import FireAndBrimstone from './modules/talents/FireAndBrimstone';
import ChannelDemonfire from './modules/talents/ChannelDemonfire';
import GrimoireOfSupremacy from './modules/talents/GrimoireOfSupremacy';
import GrimoireOfSacrifice from '../shared/modules/talents/GrimoireOfSacrifice';
import SoulConduit from './modules/talents/SoulConduit';
import Talents from './modules/talents';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    damageDone: [DamageDone, { showStatistic: true }],

    // DoTs
    immolateUptime: ImmolateUptime,

    // Core
    havoc: Havoc,
    checklist: Checklist,
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,
    grimoireOfSacrificeNormalizer: GrimoireOfSacrificeNormalizer,

    // Talents
    backdraft: Backdraft,
    eradication: Eradication,
    reverseEntropy: ReverseEntropy,
    fireAndBrimstone: FireAndBrimstone,
    channelDemonfire: ChannelDemonfire,
    grimoireOfSupremacy: GrimoireOfSupremacy,
    grimoireOfSacrifice: GrimoireOfSacrifice,
    soulConduit: SoulConduit,
    talents: Talents,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }],
  };
}

export default CombatLogParser;
