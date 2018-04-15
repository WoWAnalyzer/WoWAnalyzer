import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
// Features
import DamageDone from 'Parser/Core/Modules/DamageDone';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Abilities from './Modules/Features/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import Checklist from './Modules/Features/Checklist';
// Chi
import ChiDetails from './Modules/Chi/ChiDetails';
import ChiTracker from './Modules/Chi/ChiTracker';
// Core
import Channeling from './Modules/Core/Channeling';
// Spells
import ComboBreaker from './Modules/Spells/ComboBreaker';
import StormEarthAndFire from './Modules/Spells/StormEarthAndFire';
import FistsofFury from './Modules/Spells/FistsofFury';
import SpinningCraneKick from './Modules/Spells/SpinningCraneKick';
import ComboStrikes from './Modules/Spells/ComboStrikes';
import TouchOfKarma from './Modules/Spells/TouchOfKarma';
import BlackoutKick from './Modules/Spells/BlackoutKick';
// Talents
import HitCombo from './Modules/Talents/HitCombo';
import EnergizingElixir from './Modules/Talents/EnergizingElixir';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    channeling: Channeling,

    // Features
    damageDone: [DamageDone, { showStatistic: true }],
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,

    // Resources
    chiTracker: ChiTracker,
    chiDetails: ChiDetails,

    // Talents:
    hitCombo: HitCombo,
    energizingElixir: EnergizingElixir,

    // Spells;
    comboBreaker: ComboBreaker,
    stormEarthAndFire: StormEarthAndFire,
    fistsofFury: FistsofFury,
    spinningCraneKick: SpinningCraneKick,
    touchOfKarma: TouchOfKarma,
    comboStrikes: ComboStrikes,
    blackoutKick: BlackoutKick,
  };
}

export default CombatLogParser;
