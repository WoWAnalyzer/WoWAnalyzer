import {
  DesperatePrayer,
  Fade,
  ProtectiveLight,
  ShadowfiendNormalizer,
  TranslucentImage,
  TwinsOfTheSunPriestess,
  TwistOfFate,
} from 'analysis/retail/priest/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
import Channeling from 'parser/shared/normalizers/Channeling';
import Abilities from './modules/Abilities';
import AtonementAnalyzer from './modules/core/AtonementAnalyzer';
import GlobalCooldown from './modules/core/GlobalCooldown';
import SpellUsable from './modules/core/SpellUsable';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import AtonementApplicationSource from './modules/features/AtonementApplicationSource';
import AtonementApplicatorBreakdown from './modules/features/AtonementApplicatorBreakdown';
import AtonementDamageSource from './modules/features/AtonementDamageSource';
import AtonementHealingDone from './modules/features/AtonementHealingDone';
import PowerWordBarrier from './modules/spells/PowerWordBarrier';
import PowerWordShieldWasted from './modules/features/PowerWordShieldWasted';
import EncroachingShadows from './modules/features/EncroachingShadows';
import Atonement from './modules/spells/Atonement';
import Castigation from './modules/spells/Castigation';
import Grace from './modules/features/Grace';
import Lenience from './modules/spells/Lenience';
import Penance from './modules/spells/Penance';
import PowerWordRadianceNormalizer from './normalizers/PowerWordRadianceNormalizer';
import HarshDiscipline from './modules/spells/HarshDiscipline';
import EnduringLuminescense from './modules/spells/EnduringLuminescence';
import Indemnity from './modules/spells/Indemnity';
import Expiation from './modules/spells/Expiation';
import PowerWordShield from './modules/spells/PowerWordShield';
import PainAndSuffering from './modules/spells/PainAndSuffering';
import PowerWordRadiance from './modules/spells/PowerWordRadiance';
import Guide from './Guide';
import BlazeOfLight from './modules/spells/BlazeOfLight/BlazeOfLight';
import SelfAtonementAnalyzer from './modules/guide/SelfAtonementAnalysis';

import AbyssalReverie from './modules/spells/AbyssalReverie';
import DamageCastLink from './normalizers/DamageCastLink';
import WealAndWoe from './modules/spells/WealAndWoe';
import EternalBarrier from './modules/spells/EternalBarrier';
import Benevolence from '../shared/Benevolence';
import SurgeOfLight from 'analysis/retail/priest/shared/SurgeOfLight';
import ProtectorOfTheFrail from './modules/spells/ProtectorOfTheFrail';
import DotUptimes from './modules/features/DotUptimes';
import ShadowWordPain from 'analysis/retail/priest/shared/ShadowWordPain';
import CoreSpellManaCost from 'parser/shared/modules/SpellManaCost';
import EventLinkNormalizer from './normalizers/EventLinkNormalizer';
import AtonementNormalizer from './normalizers/AtonementTracker';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizers
    damageCastLink: DamageCastLink,
    shadowfiendNormalizer: ShadowfiendNormalizer,
    powerWordRadianceNormalizer: PowerWordRadianceNormalizer,
    atonementNormalizer: AtonementNormalizer,
    eventLinkNormalizer: EventLinkNormalizer,

    spellUsable: SpellUsable,
    spellManaCost: CoreSpellManaCost,
    lowHealthHealing: LowHealthHealing,
    abilities: Abilities,
    channeling: Channeling,
    globalCooldown: GlobalCooldown,
    atonementAnalyzer: AtonementAnalyzer,

    // Generic healer things
    manaLevelChart: ManaLevelChart,
    manaUsageChart: ManaUsageChart,

    // Features

    // Abilities
    grace: Grace,
    penance: Penance,
    alwaysBeCasting: AlwaysBeCasting,
    powerWordShieldWasted: PowerWordShieldWasted,
    atonementApplicationSource: AtonementApplicationSource,
    atonementDamageSource: AtonementDamageSource,
    atonementHealingDone: AtonementHealingDone,
    powerWordBarrier: PowerWordBarrier,
    lenience: Lenience,
    encroachingShadows: EncroachingShadows,
    atonementApplicatorBreakdown: AtonementApplicatorBreakdown,
    enduringLuminescense: EnduringLuminescense,
    powerWordRadiance: PowerWordRadiance,

    // Spells (talents and traits):
    twistOfFate: TwistOfFate,
    castigation: Castigation,
    atonement: Atonement,
    desperatePrayer: DesperatePrayer,
    fade: Fade,

    harshDiscipline: HarshDiscipline,
    indemnity: Indemnity,
    expiation: Expiation,
    powerWordShield: PowerWordShield,
    twinsOfTheSunPriestess: TwinsOfTheSunPriestess,
    painAndSuffering: PainAndSuffering,
    blazeOfLight: BlazeOfLight,
    selfAtonementAnalyzer: SelfAtonementAnalyzer,
    protectiveLight: ProtectiveLight,
    abyssalReverie: AbyssalReverie,
    wealAndWoe: WealAndWoe,
    eternalBarrier: EternalBarrier,
    SurgeOfLight: SurgeOfLight,
    benevolence: Benevolence,
    translucentImage: TranslucentImage,
    protectorOfTheFrail: ProtectorOfTheFrail,
    shadowWordPain: ShadowWordPain,

    // Guide
    dotUptimes: DotUptimes,
  };
  static guide = Guide;
}

export default CombatLogParser;
