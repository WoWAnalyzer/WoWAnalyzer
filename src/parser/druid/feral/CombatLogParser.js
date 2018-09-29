import CoreCombatLogParser from 'parser/core/CombatLogParser';

import DamageDone from 'parser/core/modules/DamageDone';

import RakeBleed from './normalizers/RakeBleed';
import ComboPointsFromAoE from './normalizers/ComboPointsFromAoE';

import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import SpellUsable from './modules/features/SpellUsable';
import SpellEnergyCost from './modules/features/SpellEnergyCost';
import EnergyCapTracker from './modules/features/EnergyCapTracker';
import EnergyTracker from './modules/features/EnergyTracker';
import EnergyDetails from './modules/features/EnergyDetails';
import Checklist from './modules/features/checklist/Module';

import RakeUptime from './modules/bleeds/RakeUptime';
import RipUptime from './modules/bleeds/RipUptime';
import FerociousBiteEnergy from './modules/spells/FerociousBiteEnergy';
import RakeSnapshot from './modules/bleeds/RakeSnapshot';
import RipSnapshot from './modules/bleeds/RipSnapshot';

import ComboPointTracker from './modules/combopoints/ComboPointTracker';
import ComboPointDetails from './modules/combopoints/ComboPointDetails';

import SavageRoarUptime from './modules/talents/SavageRoarUptime';
import MoonfireUptime from './modules/talents/MoonfireUptime';
import SavageRoarDmg from './modules/talents/SavageRoarDmg';
import MoonfireSnapshot from './modules/talents/MoonfireSnapshot';
import Predator from './modules/talents/Predator';
import Bloodtalons from './modules/talents/Bloodtalons';
import BrutalSlashHitCount from './modules/talents/BrutalSlashHitCount';

import PredatorySwiftness from './modules/spells/PredatorySwiftness';
import ThrashHitCount from './modules/spells/ThrashHitCount';
import SwipeHitCount from './modules/spells/SwipeHitCount';
import TigersFuryEnergy from './modules/spells/TigersFuryEnergy';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizers
    rakeBleed: RakeBleed,
    comboPointsFromAoE: ComboPointsFromAoE,

    // FeralCore
    damageDone: [DamageDone, { showStatistic: true }],

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
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

    // talents
    savageRoarUptime: SavageRoarUptime,
    moonfireUptime: MoonfireUptime,
    savageRoarDmg: SavageRoarDmg,
    predator: Predator,
    bloodtalons: Bloodtalons,
    brutalSlashHitCount: BrutalSlashHitCount,

    // resources
    comboPointTracker: ComboPointTracker,
    comboPointDetails: ComboPointDetails,
  };
}

export default CombatLogParser;
