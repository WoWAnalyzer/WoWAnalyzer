import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
// Core
import HealingDone from './Modules/Core/HealingDone';
import DamageTaken from './Modules/Core/DamageTaken';
import HealingReceived from './Modules/Core/HealingReceived';
import Stagger from './Modules/Core/Stagger';
import BrewCDR from './Modules/Core/BrewCDR';
import StaggerFabricator from './Modules/Core/StaggerFabricator';
// Spells
import IronSkinBrew from './Modules/Spells/IronSkinBrew';
import BlackoutCombo from './Modules/Spells/BlackoutCombo';
import KegSmash from './Modules/Spells/KegSmash';
import TigerPalm from './Modules/Spells/TigerPalm';
// Features
import Checklist from './Modules/Features/Checklist';
import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
// Items
import T20_2pc from './Modules/Items/T20_2pc';
import T20_4pc from './Modules/Items/T20_4pc';
import AnvilHardenedWristwraps from './Modules/Items/AnvilHardenedWristwraps';
// normalizers
import IronskinBrewNormalizer from './Modules/Normalizers/IronskinBrew';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    healingDone: [HealingDone, { showStatistic: true }],
    healingReceived: HealingReceived,
    damageTaken: [DamageTaken, { showStatistic: true }],
    stagger: Stagger,
    staggerFabricator: StaggerFabricator,
    damageDone: [DamageDone, { showStatistic: true }],
    brewCdr: BrewCDR,

    // Features
    checklist: Checklist,
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,

    // Spells
    ironSkinBrew: IronSkinBrew,
    blackoutCombo: BlackoutCombo,
    kegSmash: KegSmash,
    tigerPalm: TigerPalm,

    // Items
    t20_2pc: T20_2pc,
    t20_4pc: T20_4pc,
    ahw: AnvilHardenedWristwraps,

    // normalizers
    isbNormalizer: IronskinBrewNormalizer,
  };
}

export default CombatLogParser;
