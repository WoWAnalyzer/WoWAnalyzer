import CoreCombatLogParser from 'parser/core/CombatLogParser';
// Features
import DamageDone from 'parser/core/modules/DamageDone';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Abilities from './modules/Abilities';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/features/Checklist/Module';
// Chi
import ChiDetails from './modules/chi/ChiDetails';
import ChiTracker from './modules/chi/ChiTracker';
// Core
import Channeling from './modules/core/Channeling';
// Spells
import ComboBreaker from './modules/spells/ComboBreaker';
import FistsofFury from './modules/spells/FistsofFury';
import SpinningCraneKick from './modules/spells/SpinningCraneKick';
import ComboStrikes from './modules/spells/ComboStrikes';
import TouchOfKarma from './modules/spells/TouchOfKarma';
import TouchOfDeath from './modules/spells/TouchOfDeath';
import BlackoutKick from './modules/spells/BlackoutKick';
// Talents
import HitCombo from './modules/talents/HitCombo';
import EnergizingElixir from './modules/talents/EnergizingElixir';
import Serenity from './modules/talents/Serenity';
// Azerite
import IronFists from './modules/spells/AzeriteTraits/IronFists';
import MeridianStrikes from './modules/spells/AzeriteTraits/MeridianStrikes';
import SwiftRoundhouse from './modules/spells/AzeriteTraits/SwiftRoundhouse';
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
