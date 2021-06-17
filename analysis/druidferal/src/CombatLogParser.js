import CoreCombatLogParser from 'parser/core/CombatLogParser';

import ActiveDruidForm from '@wowanalyzer/druid/src/core/ActiveDruidForm';

import Abilities from './modules/Abilities';
import RakeSnapshot from './modules/bleeds/RakeSnapshot';
import RakeUptime from './modules/bleeds/RakeUptime';
import RipSnapshot from './modules/bleeds/RipSnapshot';
import RipUptime from './modules/bleeds/RipUptime';
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
import FerociousBiteEnergy from './modules/spells/FerociousBiteEnergy';
import PredatorySwiftness from './modules/spells/PredatorySwiftness';
import SwipeHitCount from './modules/spells/SwipeHitCount';
import ThrashHitCount from './modules/spells/ThrashHitCount';
import TigersFuryEnergy from './modules/spells/TigersFuryEnergy';
import Bloodtalons from './modules/talents/Bloodtalons';
import BrutalSlashHitCount from './modules/talents/BrutalSlashHitCount';
import MoonfireSnapshot from './modules/talents/MoonfireSnapshot';
import MoonfireUptime from './modules/talents/MoonfireUptime';
import Predator from './modules/talents/Predator';
import SavageRoar from './modules/talents/SavageRoar';
import BleedDebuffEvents from './normalizers/BleedDebuffEvents';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';
import ComboPointsFromAoE from './normalizers/ComboPointsFromAoE';
import RakeBleed from './normalizers/RakeBleed';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizers
    rakeBleed: RakeBleed,
    bleedDebuffEvents: BleedDebuffEvents,
    castLinkNormalizer: CastLinkNormalizer,
    comboPointsFromAoE: ComboPointsFromAoE,

    // Core
    activeDruidForm: ActiveDruidForm,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    dotUptimesAndSnapshots: DotUptimesAndSnapshots,
    ferociousBiteEnergy: FerociousBiteEnergy,
    spellUsable: SpellUsable,
    spellEnergyCost: SpellEnergyCost,
    energyCapTracker: EnergyCapTracker,
    energyTracker: EnergyTracker,
    energyDetails: EnergyDetails,
    checklist: Checklist,

    // bleeds
    rakeUptime: RakeUptime,
    ripUptime: RipUptime,
    rakeSnapshot: RakeSnapshot,
    ripSnapshot: RipSnapshot,
    moonfireSnapshot: MoonfireSnapshot,

    // spells
    predatorySwiftness: PredatorySwiftness,
    thrashHitCount: ThrashHitCount,
    swipeHitCount: SwipeHitCount,
    tigersFuryEnergy: TigersFuryEnergy,
    shadowmeld: Shadowmeld,

    // talents
    moonfireUptime: MoonfireUptime,
    savageRoar: SavageRoar,
    predator: Predator,
    bloodtalons: Bloodtalons,
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
