import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

// Features
import DamageDone from 'Parser/Core/Modules/DamageDone';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Abilities from './Modules/Features/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import ComboStrikes from './Modules/Features/ComboStrikes';

// Spells
import ComboBreaker from './Modules/Spells/ComboBreaker';
import StormEarthAndFire from './Modules/Spells/StormEarthAndFire';
import FistsofFury from './Modules/Spells/FistsofFury';

// Talents
import HitCombo from './Modules/Talents/HitCombo';
import EnergizingElixir from './Modules/Talents/EnergizingElixir';

// Legendaries
import KatsuosEclipse from './Modules/Items/KatsuosEclipse';
import CenedrilReflectorOfHatred from './Modules/Items/CenedrilReflectorOfHatred';
import SoulOfTheGrandmaster from './Modules/Items/SoulOfTheGrandmaster';
import TheEmperorsCapacitor from './Modules/Items/TheEmperorsCapacitor';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    damageDone: [DamageDone, { showStatistic: true }],
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    comboStrikes: ComboStrikes,

    // Talents:
    hitCombo: HitCombo,
    energizingElixir: EnergizingElixir,

    // Spells;
    comboBreaker: ComboBreaker,
    stormEarthAndFire: StormEarthAndFire,
    fistsofFury: FistsofFury,

    // Legendaries / Items:
    katsuosEclipse: KatsuosEclipse,
    cenedrilReflectorOfHatred: CenedrilReflectorOfHatred,
    soulOfTheGrandmaster: SoulOfTheGrandmaster,
    theEmperorsCapacitor: TheEmperorsCapacitor,
  };
}

export default CombatLogParser;
