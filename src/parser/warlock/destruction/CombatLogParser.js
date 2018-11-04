import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/shared/modules/DamageDone';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import ImmolateUptime from './modules/features/ImmolateUptime';
import Havoc from './modules/features/Havoc';
import SpellUsable from './modules/core/SpellUsable';

import SoulShardTracker from './modules/soulshards/SoulShardTracker';
import SoulShardDetails from './modules/soulshards/SoulShardDetails';

import Backdraft from './modules/features/Backdraft';
import Eradication from './modules/talents/Eradication';
import ReverseEntropy from './modules/talents/ReverseEntropy';
import InternalCombustion from './modules/talents/InternalCombustion';
import Shadowburn from './modules/talents/Shadowburn';
import FireAndBrimstone from './modules/talents/FireAndBrimstone';
import ChannelDemonfire from './modules/talents/ChannelDemonfire';
import GrimoireOfSupremacy from './modules/talents/GrimoireOfSupremacy';
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
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,
    spellUsable: SpellUsable,

    // Talents
    backdraft: Backdraft,
    eradication: Eradication,
    reverseEntropy: ReverseEntropy,
    internalCombustion: InternalCombustion,
    shadowburn: Shadowburn,
    fireAndBrimstone: FireAndBrimstone,
    channelDemonfire: ChannelDemonfire,
    grimoireOfSupremacy: GrimoireOfSupremacy,
    soulConduit: SoulConduit,
    talents: Talents,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }],
  };
}

export default CombatLogParser;
