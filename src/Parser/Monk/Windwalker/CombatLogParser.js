import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
// Features
import DamageDone from 'Parser/Core/Modules/DamageDone';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Abilities from './Modules/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import Checklist from './Modules/Features/Checklist/Module';
// Chi
import ChiDetails from './Modules/Chi/ChiDetails';
import ChiTracker from './Modules/Chi/ChiTracker';
// Core
import Channeling from './Modules/Core/Channeling';
// Spells
import ComboBreaker from './Modules/Spells/ComboBreaker';
import FistsofFury from './Modules/Spells/FistsofFury';
import SpinningCraneKick from './Modules/Spells/SpinningCraneKick';
import ComboStrikes from './Modules/Spells/ComboStrikes';
import TouchOfKarma from './Modules/Spells/TouchOfKarma';
import TouchOfDeath from './Modules/Spells/TouchOfDeath';
import BlackoutKick from './Modules/Spells/BlackoutKick';
// Talents
import HitCombo from './Modules/Talents/HitCombo';
import EnergizingElixir from './Modules/Talents/EnergizingElixir';
import Serenity from './Modules/Talents/Serenity';
// Azerite
import IronFists from './Modules/Spells/AzeriteTraits/IronFists';
import MeridianStrikes from './Modules/Spells/AzeriteTraits/MeridianStrikes';
import SwiftRoundhouse from './Modules/Spells/AzeriteTraits/SwiftRoundhouse';
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
    serenity: Serenity,

    // Spells;
    comboBreaker: ComboBreaker,
    fistsofFury: FistsofFury,
    spinningCraneKick: SpinningCraneKick,
    touchOfKarma: TouchOfKarma,
    touchOfDeath: TouchOfDeath,
    comboStrikes: ComboStrikes,
    blackoutKick: BlackoutKick,

    // Azerite
    ironFists: IronFists,
    meridianStrikes: MeridianStrikes,
    swiftRoundhouse: SwiftRoundhouse,
  };
}

export default CombatLogParser;
