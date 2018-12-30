import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/shared/modules/DamageDone';
// Core
import HealingDone from './modules/core/HealingDone';
import DamageTaken from './modules/core/DamageTaken';
import HealingReceived from './modules/core/HealingReceived';
import Stagger from './modules/core/Stagger';
import BrewCDR from './modules/core/BrewCDR';
import SharedBrews from './modules/core/SharedBrews';
import StaggerFabricator from './modules/core/StaggerFabricator';
import GlobalCooldown from './modules/core/GlobalCooldown';
import Channeling from './modules/core/Channeling';
import MasteryValue from './modules/core/MasteryValue';
import AgilityValue from './modules/features/AgilityValue';
// Spells
import IronSkinBrew from './modules/spells/IronSkinBrew';
import PurifyingBrew from './modules/spells/PurifyingBrew';
import BlackoutCombo from './modules/spells/BlackoutCombo';
import KegSmash from './modules/spells/KegSmash';
import TigerPalm from './modules/spells/TigerPalm';
import RushingJadeWind from './modules/spells/RushingJadeWind';
import BreathOfFire from './modules/spells/BreathOfFire';
import BlackOxBrew from './modules/spells/BlackOxBrew';
import HighTolerance from './modules/spells/HighTolerance';
import Guard from './modules/spells/Guard';
import CelestialFortune from './modules/spells/CelestialFortune';
import GiftOfTheOxStat from './modules/spells/GiftOfTheOx';
// Azerite Traits
import TrainingOfNiuzao from './modules/spells/azeritetraits/TrainingOfNiuzao';
import StaggeringStrikes from './modules/spells/azeritetraits/StaggeringStrikes';
import ElusiveFootwork from './modules/spells/azeritetraits/ElusiveFootwork';
import FitToBurst from './modules/spells/azeritetraits/FitToBurst';
// Features
import Checklist from './modules/features/checklist/Module';
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import StaggerPoolGraph from './modules/features/StaggerPoolGraph';
import MitigationCheck from './modules/features/MitigationCheck';
import MitigationSheet from './modules/features/MitigationSheet';

// Items
// normalizers
import IronskinBrewNormalizer from './normalizers/IronskinBrew';
import GiftOfTheOx from './normalizers/GiftOfTheOx';
import ExpelHarmNorm from './normalizers/ExpelHarm';

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
    agilityValue: AgilityValue,
    masteryValue: MasteryValue,
    mitigationCheck: MitigationCheck,

    // Features
    checklist: Checklist,
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    staggerPoolGraph: StaggerPoolGraph,
    sheet: MitigationSheet,

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
    cf: CelestialFortune,
    gotox: GiftOfTheOxStat,

    // Azerite Traits
    trainingOfNiuzao: TrainingOfNiuzao,
    staggeringStrikes: StaggeringStrikes,
    elusiveFootwork: ElusiveFootwork,
    fitToBurst: FitToBurst,

    // Items

    // normalizers
    isbNormalizer: IronskinBrewNormalizer,
    gotoxNorm: GiftOfTheOx,
    ehNorm: ExpelHarmNorm,
  };
}

export default CombatLogParser;
