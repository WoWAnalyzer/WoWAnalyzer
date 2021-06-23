import CoreCombatLogParser from 'parser/core/CombatLogParser';

import ActiveDruidForm from '@wowanalyzer/druid/src/core/ActiveDruidForm';

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
import DraughtOfDeepFocus from './modules/shadowlands/DraughtOfDeepFocus';
import Frenzyband from './modules/shadowlands/Frenzyband';
import FerociousBite from './modules/spells/FerociousBite';
import PredatorySwiftness from './modules/spells/PredatorySwiftness';
import SwipeHitCount from './modules/spells/SwipeHitCount';
import ThrashHitCount from './modules/spells/ThrashHitCount';
import TigersFuryEnergy from './modules/spells/TigersFuryEnergy';
import Bloodtalons from './modules/talents/Bloodtalons';
import Bloodtalons2 from './modules/talents/Bloodtalons2';
import BrutalSlashHitCount from './modules/talents/BrutalSlashHitCount';
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
    thrashHitCount: ThrashHitCount,
    swipeHitCount: SwipeHitCount,
    tigersFuryEnergy: TigersFuryEnergy,
    shadowmeld: Shadowmeld,

    // talents
    moonfireUptime: MoonfireUptimeAndSnapshots,
    savageRoar: SavageRoar,
    predator: Predator,
    bloodtalons: Bloodtalons, // TODO depcrecated, remove?
    bloodtalons2: Bloodtalons2,
    brutalSlashHitCount: BrutalSlashHitCount,

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
  };
}

export default CombatLogParser;
