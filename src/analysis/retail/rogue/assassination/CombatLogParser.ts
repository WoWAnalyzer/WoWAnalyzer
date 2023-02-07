import {
  ComboPointDetails,
  ComboPointTracker,
  EnergyDetails,
  EnergyTracker,
  SpellEnergyCost,
  SpellUsable,
  ThistleTeaCastLinkNormalizer,
} from 'analysis/retail/rogue/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import ComboPointGraph from 'analysis/retail/rogue/shared/ComboPointGraph';
import EnergyGraph from 'analysis/retail/rogue/shared/EnergyGraph';

import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import GarroteUptimeAndSnapshots from './modules/spells/GarroteUptimeAndSnapshots';
import RuptureUptimeAndSnapshots from './modules/spells/RuptureUptimeAndSnapshots';
import CrimsonTempestUptimeAndSnapshots from './modules/talents/CrimsonTempestUptimeAndSnapshots';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';
import DotUptimesAndSnapshots from './modules/features/DotUptimesAndSnapshots';
import BuilderUse from './modules/core/BuilderUse';
import FinisherUse from './modules/core/FinisherUse';
import HitCountAoE from './modules/core/HitCountAoE';
import Envenom from './modules/spells/Envenom';
import Exsanguinate from './modules/talents/Exsanguinate';
import ThistleTea from './modules/talents/ThistleTea';
import Guide from './Guide';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Feature
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    spellUsable: SpellUsable,

    // Normalizers
    castLinkNormalizer: CastLinkNormalizer,
    thistleTeaCastLinkNormalizer: ThistleTeaCastLinkNormalizer,

    // Resource
    comboPointTracker: ComboPointTracker,
    comboPointDetails: ComboPointDetails,
    comboPointGraph: ComboPointGraph,
    energyTracker: EnergyTracker,
    energyDetails: EnergyDetails,
    energyGraph: EnergyGraph,
    spellEnergyCost: SpellEnergyCost,

    // Core
    builderUse: BuilderUse,
    finisherUse: FinisherUse,
    hitCountAoe: HitCountAoE,
    dotUptimesAndSnapshots: DotUptimesAndSnapshots,

    // Spells
    garroteUptimeAndSnapshots: GarroteUptimeAndSnapshots,
    ruptureUptimeAndSnapshots: RuptureUptimeAndSnapshots,
    envenom: Envenom,

    // Talents
    crimsonTempestUptimeAndSnapshots: CrimsonTempestUptimeAndSnapshots,
    exsanguinate: Exsanguinate,
    thistleTea: ThistleTea,

    // Racials
    arcaneTorrent: [ArcaneTorrent, { gcd: 1000 }] as const,
  };

  static guide = Guide;
}

export default CombatLogParser;
