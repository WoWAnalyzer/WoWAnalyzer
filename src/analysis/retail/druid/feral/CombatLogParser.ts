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
import TasteForBlood from 'analysis/retail/druid/feral/modules/spells/TasteForBlood';
import ThrashUptimeAndSnapshot from 'analysis/retail/druid/feral/modules/spells/ThrashUptimeAndSnapshot';
import LionsStrength from 'analysis/retail/druid/feral/modules/spells/LionsStrength';
import CarnivorousInstinct from 'analysis/retail/druid/feral/modules/spells/CarnivorousInstinct';
import BrutalSlash from 'analysis/retail/druid/feral/modules/spells/BrutalSlash';
import OmenAndMomentOfClarity from 'analysis/retail/druid/feral/modules/spells/OmenAndMomentOfClarity';
import FeralFrenzy from 'analysis/retail/druid/feral/modules/spells/FeralFrenzy';
import SaberJaws from 'analysis/retail/druid/feral/modules/spells/SaberJaws';
import AdaptiveSwarm from 'analysis/retail/druid/feral/modules/spells/AdaptiveSwarm';
import SoulOfTheForestLinkNormalizer from 'analysis/retail/druid/feral/normalizers/SoulOfTheForestLinkNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizers
    rakeBleed: RakeBleed,
    castLinkNormalizer: CastLinkNormalizer,
    ferociousBiteDrainLinkNormalizer: FerociousBiteDrainLinkNormalizer,
    bloodtalonsLinkNormalizer: BloodtalonsLinkNormalizer,
    soulOfTheForestLinkNormalizer: SoulOfTheForestLinkNormalizer,
    suddenAmbushLinkNormalizer: SuddenAmbushLinkNormalizer,

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
    adaptiveSwarm: AdaptiveSwarm,
    berserk: Berserk,
    rampantFerocity: RampantFerocity,
    doubleClawedRake: DoubleClawedRake,
    sabertooth: Sabertooth,
    suddenAmbush: SuddenAmbush,
    tasteForBlood: TasteForBlood,
    lionsStrength: LionsStrength,
    carnivorousInstinct: CarnivorousInstinct,
    brutalSlash: BrutalSlash,
    omenAndMomentOfClarity: OmenAndMomentOfClarity,
    feralFrenzy: FeralFrenzy,
    saberJaws: SaberJaws,
    // TODO TWW - might actually want a Tiger's Tenacity module now

    // tier
  };

  static guide = Guide;
}

export default CombatLogParser;
