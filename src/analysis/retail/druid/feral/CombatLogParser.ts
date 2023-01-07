import ActiveDruidForm from 'analysis/retail/druid/shared/core/ActiveDruidForm';
import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import RakeUptimeAndSnapshots from 'analysis/retail/druid/feral/modules/spells/RakeUptimeAndSnapshots';
import RipUptimeAndSnapshots from 'analysis/retail/druid/feral/modules/spells/RipUptimeAndSnapshots';
import Buffs from './modules/Buffs';
import ComboPointDetails from 'analysis/retail/druid/feral/modules/core/combopoints/ComboPointDetails';
import ComboPointTracker from 'analysis/retail/druid/feral/modules/core/combopoints/ComboPointTracker';
import FinisherUse from 'analysis/retail/druid/feral/modules/core/combopoints/FinisherUse';
import DotUptimesAndSnapshots from 'analysis/retail/druid/feral/modules/features/DotUptimesAndSnapshots';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import EnergyDetails from 'analysis/retail/druid/feral/modules/core/energy/EnergyDetails';
import EnergyTracker from 'analysis/retail/druid/feral/modules/core/energy/EnergyTracker';
import SpellEnergyCost from 'analysis/retail/druid/feral/modules/core/energy/SpellEnergyCost';
import SpellUsable from './modules/features/SpellUsable';
import AdaptiveSwarmFeral from 'analysis/retail/druid/feral/modules/spells/AdaptiveSwarmFeral';
import ApexPredatorsCraving from 'analysis/retail/druid/feral/modules/spells/ApexPredatorsCraving';
import ConvokeSpiritsFeral from 'analysis/retail/druid/feral/modules/spells/ConvokeSpiritsFeral';
import Berserk from 'analysis/retail/druid/feral/modules/spells/Berserk';
import FerociousBite from './modules/spells/FerociousBite';
import HitCountAoE from './modules/spells/HitCountAoE';
import TigersFuryEnergy from './modules/spells/TigersFuryEnergy';
import Bloodtalons from 'analysis/retail/druid/feral/modules/spells/Bloodtalons';
import MoonfireUptimeAndSnapshots from 'analysis/retail/druid/feral/modules/spells/MoonfireUptimeAndSnapshots';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';
import FerociousBiteDrainLinkNormalizer from './normalizers/FerociousBiteDrainLinkNormalizer';
import RakeBleed from './normalizers/RakeBleed';
import Guide from 'analysis/retail/druid/feral/Guide';
import BloodtalonsLinkNormalizer from 'analysis/retail/druid/feral/normalizers/BloodtalonsLinkNormalizer';
import RampantFerocity from 'analysis/retail/druid/feral/modules/spells/RampantFerocity';
import EnergyGraph from 'analysis/retail/druid/feral/modules/core/energy/EnergyGraph';
import BuilderUse from 'analysis/retail/druid/feral/modules/core/combopoints/BuilderUse';
import DoubleClawedRake from 'analysis/retail/druid/feral/modules/spells/DoubleClawedRake';
import Sabertooth from 'analysis/retail/druid/feral/modules/spells/Sabertooth';
import SuddenAmbushLinkNormalizer from 'analysis/retail/druid/feral/normalizers/SuddenAmbushLinkNormalizer';
import SuddenAmbush from 'analysis/retail/druid/feral/modules/spells/SuddenAmbush';
import RampantFerocityLinkNormalizer from 'analysis/retail/druid/feral/normalizers/RampantFerocityLinkNormalizer';
import TasteForBlood from 'analysis/retail/druid/feral/modules/spells/TasteForBlood';
import RagingFury from 'analysis/retail/druid/feral/modules/spells/RagingFury';
import ThrashUptimeAndSnapshot from 'analysis/retail/druid/feral/modules/spells/ThrashUptimeAndSnapshot';
import LionsStrength from 'analysis/retail/druid/feral/modules/spells/LionsStrength';
import CarnivorousInstinct from 'analysis/retail/druid/feral/modules/spells/CarnivorousInstinct';
import BrutalSlash from 'analysis/retail/druid/feral/modules/spells/BrutalSlash';
import OmenAndMomentOfClarity from 'analysis/retail/druid/feral/modules/spells/OmenAndMomentOfClarity';
import FeralFrenzy from 'analysis/retail/druid/feral/modules/spells/FeralFrenzy';
import Tier29 from 'analysis/retail/druid/feral/modules/dragonflight/Tier29';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizers
    rakeBleed: RakeBleed,
    castLinkNormalizer: CastLinkNormalizer,
    ferociousBiteDrainLinkNormalizer: FerociousBiteDrainLinkNormalizer,
    bloodtalonsLinkNormalizer: BloodtalonsLinkNormalizer,
    suddenAmbushLinkNormalizer: SuddenAmbushLinkNormalizer,
    rampantFerocityLinkNormalizer: RampantFerocityLinkNormalizer,

    // Core
    activeDruidForm: ActiveDruidForm,
    spellEnergyCost: SpellEnergyCost,

    // Energy
    energyTracker: EnergyTracker,
    energyDetails: EnergyDetails,
    energyGraph: EnergyGraph,

    // Combo Points
    comboPointTracker: ComboPointTracker,
    comboPointDetails: ComboPointDetails,
    finisherUse: FinisherUse,
    builderUse: BuilderUse,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    dotUptimesAndSnapshots: DotUptimesAndSnapshots,
    ferociousBite: FerociousBite,
    spellUsable: SpellUsable,

    // bleeds
    rakeUptime: RakeUptimeAndSnapshots,
    ripUptime: RipUptimeAndSnapshots,
    thrashUptime: ThrashUptimeAndSnapshot,

    // spells
    tigersFuryEnergy: TigersFuryEnergy,
    hitCountAoe: HitCountAoE,

    // talents
    moonfireUptime: MoonfireUptimeAndSnapshots,
    bloodtalons: Bloodtalons,
    apexPredatorsCraving: ApexPredatorsCraving,
    convokeSpirits: ConvokeSpiritsFeral,
    adaptiveSwarm: AdaptiveSwarmFeral,
    berserk: Berserk,
    rampantFerocity: RampantFerocity,
    doubleClawedRake: DoubleClawedRake,
    sabertooth: Sabertooth,
    suddenAmbush: SuddenAmbush,
    tasteForBlood: TasteForBlood,
    ragingFury: RagingFury,
    lionsStrength: LionsStrength,
    carnivorousInstinct: CarnivorousInstinct,
    brutalSlash: BrutalSlash,
    omenAndMomentOfClarity: OmenAndMomentOfClarity,
    feralFrenzy: FeralFrenzy,

    // tier
    tier29: Tier29,
  };

  static guide = Guide;
}

export default CombatLogParser;
