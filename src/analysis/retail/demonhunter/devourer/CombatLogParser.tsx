import CoreCombatLogParser from 'parser/core/CombatLogParser';
import Channeling from 'parser/shared/normalizers/Channeling';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import { Buffs } from 'analysis/retail/demonhunter/devourer/modules/Buffs';
import { GlobalCooldown } from 'analysis/retail/demonhunter/devourer/modules/core/GlobalCooldown';
import { AlwaysBeCasting } from 'analysis/retail/demonhunter/devourer/modules/features/AlwaysBeCasting';
import { CooldownThroughputTracker } from 'analysis/retail/demonhunter/devourer/modules/features/CooldownThroughputTracker';
import { FuryTracker } from 'analysis/retail/demonhunter/devourer/modules/resourcetracker/FuryTracker';
import { FuryDetails } from 'analysis/retail/demonhunter/devourer/modules/resourcetracker/FuryDetails';
import { FuryGraph } from 'analysis/retail/demonhunter/devourer/modules/resourcetracker/FuryGraph';
import Abilities from './modules/Abilities';
import CollapsingStar from './modules/talents/CollapsingStar';
import Guide from './Guide';
import VoidMetamorphosisNormalizer from './normalizers/VoidMetamorphosisNormalizer';
import ViolentTransformation from './modules/talents/ViolentTransformation';
import MomentOfCraving from './modules/talents/MomentOfCraving';
import MassAcceleration from './modules/talents/MassAcceleration';

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
    collapsingStar: CollapsingStar,
    momentOfCraving: MomentOfCraving,
    massAcceleration: MassAcceleration,

    // Hero
    violentTransformation: ViolentTransformation,

    // Resources
    furyTracker: FuryTracker,
    furyDetails: FuryDetails,
    furyGraph: FuryGraph,

    // Normalizers
    voidMetamorphosisNormalizer: VoidMetamorphosisNormalizer,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };

  static guide = Guide;
}

export default CombatLogParser;
