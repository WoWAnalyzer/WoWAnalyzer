import ActiveDruidForm from 'analysis/retail/druid/core/ActiveDruidForm';
import DraughtOfDeepFocus from 'analysis/retail/druid/shadowlands/DraughtOfDeepFocus';
import RavenousFrenzy from 'analysis/retail/druid/shadowlands/RavenousFrenzy';
import { SinfulHysteria } from 'analysis/retail/druid/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import RakeUptimeAndSnapshots from './modules/bleeds/RakeUptimeAndSnapshots';
import RipUptimeAndSnapshots from './modules/bleeds/RipUptimeAndSnapshots';
import Buffs from './modules/Buffs';
import ComboPointDetails from './modules/combopoints/ComboPointDetails';
import ComboPointTracker from './modules/combopoints/ComboPointTracker';
import FinisherUse from './modules/combopoints/FinisherUse';
import DotUptimesAndSnapshots from './modules/core/DotUptimesAndSnapshots';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import EnergyCapTracker from './modules/features/EnergyCapTracker';
import EnergyDetails from './modules/features/EnergyDetails';
import EnergyTracker from './modules/features/EnergyTracker';
import SpellEnergyCost from './modules/features/SpellEnergyCost';
import SpellUsable from './modules/features/SpellUsable';
import Shadowmeld from './modules/racials/Shadowmeld';
import AdaptiveSwarmFeral from './modules/shadowlands/AdaptiveSwarmFeral';
import ApexPredatorsCraving from './modules/shadowlands/ApexPredatorsCraving';
import ConvokeSpiritsFeral from './modules/shadowlands/ConvokeSpiritsFeral';
import Frenzyband from './modules/shadowlands/Frenzyband';
import Tier28_2pc from './modules/shadowlands/Tier28_2pc';
import Tier28_4pc from './modules/shadowlands/Tier28_4pc';
import FerociousBite from './modules/spells/FerociousBite';
import HitCountAoE from './modules/spells/HitCountAoE';
import PredatorySwiftness from './modules/spells/PredatorySwiftness';
import TigersFuryEnergy from './modules/spells/TigersFuryEnergy';
import Bloodtalons from './modules/talents/Bloodtalons';
import MoonfireUptimeAndSnapshots from './modules/talents/MoonfireUptimeAndSnapshots';
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
    frenzyband: Frenzyband,
    adaptiveSwarm: AdaptiveSwarmFeral,
    sinfulHysteria: SinfulHysteria,
    ravenousFrenzy: RavenousFrenzy,
    tier28_2pc: Tier28_2pc,
    tier28_4pc: Tier28_4pc,
  };
}

export default CombatLogParser;
