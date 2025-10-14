import CoreCombatLogParser from 'parser/core/CombatLogParser';
import Channeling from 'parser/shared/normalizers/Channeling';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import { Buffs } from 'analysis/retail/demonhunter/devourer/modules/Buffs';
import { GlobalCooldown } from 'analysis/retail/demonhunter/devourer/modules/core/GlobalCooldown';
import { AlwaysBeCasting } from 'analysis/retail/demonhunter/devourer/modules/features/AlwaysBeCasting';
import { Abilities } from 'analysis/retail/demonhunter/devourer/modules/Abilities';
import { CooldownThroughputTracker } from 'analysis/retail/demonhunter/devourer/modules/features/CooldownThroughputTracker';
import { FuryTracker } from 'analysis/retail/demonhunter/devourer/modules/resourcetracker/FuryTracker';
import { FuryDetails } from 'analysis/retail/demonhunter/devourer/modules/resourcetracker/FuryDetails';
import { FuryGraph } from 'analysis/retail/demonhunter/devourer/modules/resourcetracker/FuryGraph';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core Statistics
    channeling: Channeling,
    buffs: Buffs,

    globalCooldown: GlobalCooldown,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,

    // Talents

    // Hero

    // Resources
    furyTracker: FuryTracker,
    furyDetails: FuryDetails,
    furyGraph: FuryGraph,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
}

export default CombatLogParser;
