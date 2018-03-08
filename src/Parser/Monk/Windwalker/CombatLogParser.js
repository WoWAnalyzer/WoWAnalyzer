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
// Talents
import HitCombo from './Modules/Talents/HitCombo';
import EnergizingElixir from './Modules/Talents/EnergizingElixir';
// Legendaries / Items
import KatsuosEclipse from './Modules/Items/KatsuosEclipse';
import CenedrilReflectorOfHatred from './Modules/Items/CenedrilReflectorOfHatred';
import SoulOfTheGrandmaster from './Modules/Items/SoulOfTheGrandmaster';
import TheEmperorsCapacitor from './Modules/Items/TheEmperorsCapacitor';
import DrinkingHornCover from './Modules/Items/DrinkingHornCover';
import TheWindBlows from './Modules/Items/TheWindBlows';
import T21_4set from './Modules/Items/T21_4set';

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

    // Legendaries / Items:
    katsuosEclipse: KatsuosEclipse,
    cenedrilReflectorOfHatred: CenedrilReflectorOfHatred,
    soulOfTheGrandmaster: SoulOfTheGrandmaster,
    theEmperorsCapacitor: TheEmperorsCapacitor,
    drinkingHornCover: DrinkingHornCover,
    theWindBlows: TheWindBlows,
    T21_4set: T21_4set,
  };
}

export default CombatLogParser;
