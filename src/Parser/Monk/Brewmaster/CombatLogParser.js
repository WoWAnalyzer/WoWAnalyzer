import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
// Core
import HealingDone from './Modules/Core/HealingDone';
import DamageTaken from './Modules/Core/DamageTaken';
import HealingReceived from './Modules/Core/HealingReceived';
import Stagger from './Modules/Core/Stagger';
import BrewCDR from './Modules/Core/BrewCDR';
import SharedBrews from './Modules/Core/SharedBrews';
import StaggerFabricator from './Modules/Core/StaggerFabricator';
import GlobalCooldown from './Modules/Core/GlobalCooldown';
import Channeling from './Modules/Core/Channeling';
import MasteryValue from './Modules/Core/MasteryValue';
// Spells
import IronSkinBrew from './Modules/Spells/IronSkinBrew';
import PurifyingBrew from './Modules/Spells/PurifyingBrew';
import BlackoutCombo from './Modules/Spells/BlackoutCombo';
import KegSmash from './Modules/Spells/KegSmash';
import TigerPalm from './Modules/Spells/TigerPalm';
import RushingJadeWind from './Modules/Spells/RushingJadeWind';
import BreathOfFire from './Modules/Spells/BreathOfFire';
import BlackOxBrew from './Modules/Spells/BlackOxBrew';
import HighTolerance from './Modules/Spells/HighTolerance';
import Guard from './Modules/Spells/Guard';
// Azerite Traits
import TrainingOfNiuzao from './Modules/Spells/AzeriteTraits/TrainingOfNiuzao';
import StaggeringStrikes from './Modules/Spells/AzeriteTraits/StaggeringStrikes';
import ElusiveFootwork from './Modules/Spells/AzeriteTraits/ElusiveFootwork';
import FitToBurst from './Modules/Spells/AzeriteTraits/FitToBurst';
// Features
import Checklist from './Modules/Features/Checklist';
import Abilities from './Modules/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import StaggerPoolGraph from './Modules/Features/StaggerPoolGraph';
import MitigationCheck from './Modules/Features/MitigationCheck';

// Items
import T20_2pc from './Modules/Items/T20_2pc';
import T20_4pc from './Modules/Items/T20_4pc';
import AnvilHardenedWristwraps from './Modules/Items/AnvilHardenedWristwraps';
import StormstoutsLastGasp from './Modules/Items/StormstoutsLastGasp';
import SalsalabimsLostTunic from './Modules/Items/SalsalabimsLostTunic';
// normalizers
import IronskinBrewNormalizer from './Modules/Normalizers/IronskinBrew';
import GarothiWorldbreakerMeleeNormalizer from './Modules/Normalizers/GarothiWorldbreakerMelee';
import GiftOfTheOx from './Modules/Normalizers/GiftOfTheOx';

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
    brews: SharedBrews,
    channeling: Channeling,
    globalCooldown: GlobalCooldown,
    masteryValue: MasteryValue,
    mitigationCheck: MitigationCheck,

    // Features
    checklist: Checklist,
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    staggerPoolGraph: StaggerPoolGraph,

    // Spells
    ironSkinBrew: IronSkinBrew,
    purifyingBrew: PurifyingBrew,
    blackoutCombo: BlackoutCombo,
    kegSmash: KegSmash,
    tigerPalm: TigerPalm,
    rjw: RushingJadeWind,
    bof: BreathOfFire,
    bob: BlackOxBrew,
    highTolerance: HighTolerance,
    guard: Guard,

    // Azerite Traits
    trainingOfNiuzao: TrainingOfNiuzao,
    staggeringStrikes: StaggeringStrikes,
    elusiveFootwork: ElusiveFootwork,
    fitToBurst: FitToBurst,

    // Items
    t20_2pc: T20_2pc,
    t20_4pc: T20_4pc,
    ahw: AnvilHardenedWristwraps,
    stormstoutsLastGasp: StormstoutsLastGasp,
    salsalabim: SalsalabimsLostTunic,

    // normalizers
    isbNormalizer: IronskinBrewNormalizer,
    garothi: GarothiWorldbreakerMeleeNormalizer,
    gotox: GiftOfTheOx,
  };
}

export default CombatLogParser;
