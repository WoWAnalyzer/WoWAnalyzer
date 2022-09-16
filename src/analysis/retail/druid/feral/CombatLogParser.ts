import ActiveDruidForm from 'analysis/retail/druid/shared/core/ActiveDruidForm';
import DraughtOfDeepFocus from 'analysis/retail/druid/shared/spells/DraughtOfDeepFocus';
import RavenousFrenzy from 'analysis/retail/druid/shared/spells/RavenousFrenzy';
import { SinfulHysteria } from 'analysis/retail/druid/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import RakeUptimeAndSnapshots from 'analysis/retail/druid/feral/modules/features/RakeUptimeAndSnapshots';
import RipUptimeAndSnapshots from 'analysis/retail/druid/feral/modules/features/RipUptimeAndSnapshots';
import Buffs from './modules/Buffs';
import ComboPointDetails from 'analysis/retail/druid/feral/modules/core/ComboPointDetails';
import ComboPointTracker from 'analysis/retail/druid/feral/modules/core/ComboPointTracker';
import FinisherUse from 'analysis/retail/druid/feral/modules/features/FinisherUse';
import DotUptimesAndSnapshots from 'analysis/retail/druid/feral/modules/features/DotUptimesAndSnapshots';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import EnergyCapTracker from './modules/features/EnergyCapTracker';
import EnergyDetails from './modules/features/EnergyDetails';
import EnergyTracker from './modules/features/EnergyTracker';
import SpellEnergyCost from './modules/features/SpellEnergyCost';
import SpellUsable from './modules/features/SpellUsable';
import Shadowmeld from './modules/racials/Shadowmeld';
import AdaptiveSwarmFeral from 'analysis/retail/druid/feral/modules/spells/AdaptiveSwarmFeral';
import ApexPredatorsCraving from 'analysis/retail/druid/feral/modules/spells/ApexPredatorsCraving';
import ConvokeSpiritsFeral from 'analysis/retail/druid/feral/modules/spells/ConvokeSpiritsFeral';
import BerserkBoosts from './modules/spells/BerserkBoosts';
import FerociousBite from './modules/spells/FerociousBite';
import HitCountAoE from './modules/spells/HitCountAoE';
import PredatorySwiftness from './modules/spells/PredatorySwiftness';
import TigersFuryEnergy from './modules/spells/TigersFuryEnergy';
import Bloodtalons from 'analysis/retail/druid/feral/modules/spells/Bloodtalons';
import MoonfireUptimeAndSnapshots from 'analysis/retail/druid/feral/modules/features/MoonfireUptimeAndSnapshots';
import Predator from './modules/talents/Predator';
import SavageRoar from './modules/talents/SavageRoar';
import BleedDebuffEvents from './normalizers/BleedDebuffEvents';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';
import ComboPointsFromAoE from './normalizers/ComboPointsFromAoE';
import FerociousBiteDrainLinkNormalizer from './normalizers/FerociousBiteDrainLinkNormalizer';
import RakeBleed from './normalizers/RakeBleed';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizers
    rakeBleed: RakeBleed,
    bleedDebuffEvents: BleedDebuffEvents,
    castLinkNormalizer: CastLinkNormalizer,
    ferociousBiteDrainLinkNormalizer: FerociousBiteDrainLinkNormalizer,
    comboPointsFromAoE: ComboPointsFromAoE,

    // Core
    activeDruidForm: ActiveDruidForm,
    spellEnergyCost: SpellEnergyCost,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    dotUptimesAndSnapshots: DotUptimesAndSnapshots,
    ferociousBite: FerociousBite,
    spellUsable: SpellUsable,
    energyCapTracker: EnergyCapTracker,
    energyTracker: EnergyTracker,
    energyDetails: EnergyDetails,
    checklist: Checklist,

    // bleeds
    rakeUptime: RakeUptimeAndSnapshots,
    ripUptime: RipUptimeAndSnapshots,

    // spells
    predatorySwiftness: PredatorySwiftness,
    tigersFuryEnergy: TigersFuryEnergy,
    hitCountAoe: HitCountAoE,
    shadowmeld: Shadowmeld,

    // talents
    moonfireUptime: MoonfireUptimeAndSnapshots,
    savageRoar: SavageRoar,
    predator: Predator,
    bloodtalons: Bloodtalons,

    // resources
    comboPointTracker: ComboPointTracker,
    comboPointDetails: ComboPointDetails,
    finisherUse: FinisherUse,

    // shadowlands
    apexPredatorsCraving: ApexPredatorsCraving,
    convokeSpirits: ConvokeSpiritsFeral,
    draughtOfDeepFocus: DraughtOfDeepFocus,
    frenzyband: BerserkBoosts,
    adaptiveSwarm: AdaptiveSwarmFeral,
    sinfulHysteria: SinfulHysteria,
    ravenousFrenzy: RavenousFrenzy,
    tier28_2pc: BerserkBoosts,
    tier28_4pc: Tier28_4pc,
  };
}

export default CombatLogParser;
