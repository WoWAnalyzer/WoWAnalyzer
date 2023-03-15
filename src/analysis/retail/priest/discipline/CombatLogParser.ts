import {
  DesperatePrayer,
  ShadowfiendNormalizer,
  TwinsOfTheSunPriestess,
  TwistOfFate,
} from 'analysis/retail/priest/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
import Channeling from 'parser/shared/normalizers/Channeling';

import Abilities from './modules/Abilities';
import AbilityTracker from './modules/core/AbilityTracker';
import AtonementAnalyzer from './modules/core/AtonementAnalyzer';
import GlobalCooldown from './modules/core/GlobalCooldown';
import SpellManaCost from './modules/core/SpellManaCost';
import SpellUsable from './modules/core/SpellUsable';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import AtonementApplicationSource from './modules/features/AtonementApplicationSource';
import AtonementApplicatorBreakdown from './modules/features/AtonementApplicatorBreakdown';
import AtonementDamageSource from './modules/features/AtonementDamageSource';
import AtonementHealingDone from './modules/features/AtonementHealingDone';
import Checklist from './modules/features/Checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import PowerWordBarrier from './modules/features/PowerWordBarrier';
import PowerWordShieldWasted from './modules/features/PowerWordShieldWasted';
import PurgeTheWicked from './modules/features/PurgeTheWicked';
import SolaceVsShieldDiscipline from './modules/features/SolaceVsShieldDiscipline';
import Mindgames from 'analysis/retail/priest/discipline/modules/spells/Mindgames';
import Atonement from './modules/spells/Atonement';
import Castigation from './modules/spells/Castigation';
import Contrition from './modules/spells/Contrition';
import Evangelism from './modules/spells/Evangelism';
import Grace from './modules/spells/Grace';
import Lenience from './modules/spells/Lenience';
import Penance from './modules/spells/Penance';
import Schism from './modules/spells/Schism';
import SinsOfTheMany from './modules/spells/SinsOfTheMany';
import PowerWordRadianceNormalizer from './normalizers/PowerWordRadianceNormalizer';
import HarshDiscipline from './modules/spells/HarshDiscipline';
import EnduringLuminescense from './modules/spells/EnduringLuminescence';
import Indemnity from './modules/spells/Indemnity';
import Expiation from './modules/spells/Expiation';
import PowerWordShield from './modules/spells/PowerWordShield';
import CrystallineReflection from './modules/spells/CrystallineReflection';
import PainAndSuffering from './modules/spells/PainAndSuffering';
import ThroesOfPain from './modules/spells/ThroesOfPain';
import MaliciousIntent from './modules/spells/MaliciousIntent';
import PowerWordRadiance from './modules/spells/PowerWordRadiance';
import EvangelismAnalysis from './modules/guide/EvangelismAnalysis';
import Guide from './Guide';
import BlazeOfLight from './modules/spells/BlazeOfLight/BlazeOfLight';
import SelfAtonementAnalyzer from './modules/guide/SelfAtonementAnalysis';
import ProtectiveLight from '../shared/ProtectiveLight';
import ResplendentLight from './modules/spells/ResplendentLight';
import TwilightEquilibrium from './modules/spells/TwilightEquilibrium/TwilightEquilibrium';
import RaptureAnalysis from './modules/guide/RaptureAnalysis';
import AtonementNormalizer from './normalizers/AtonementTracker';
import ShadowCovenant from './modules/spells/ShadowCovenant/ShadowCovenant';
import AbyssalReverie from './modules/spells/AbyssalReverie';
import TwilightEquilibriumNormalizer from './normalizers/TwilightEquilibriumNormalizer';
import DamageCastLink from './normalizers/DamageCastLink';
import WealAndWoe from './modules/spells/WealAndWoe';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizers
    damageCastLink: DamageCastLink,
    shadowfiendNormalizer: ShadowfiendNormalizer,
    powerWordRadianceNormalizer: PowerWordRadianceNormalizer,
    twilightEquilibriumNormalizer: TwilightEquilibriumNormalizer,
    atonementNormalizer: AtonementNormalizer,

    spellUsable: SpellUsable,
    spellManaCost: SpellManaCost,
    abilityTracker: AbilityTracker,
    lowHealthHealing: LowHealthHealing,
    abilities: Abilities,
    channeling: Channeling,
    globalCooldown: GlobalCooldown,
    atonementAnalyzer: AtonementAnalyzer,

    // Generic healer things
    manaLevelChart: ManaLevelChart,
    manaUsageChart: ManaUsageChart,

    // Features
    checklist: Checklist,

    // Abilities
    penance: Penance,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    powerWordShieldWasted: PowerWordShieldWasted,
    atonementApplicationSource: AtonementApplicationSource,
    atonementDamageSource: AtonementDamageSource,
    atonementHealingDone: AtonementHealingDone,
    powerWordBarrier: PowerWordBarrier,
    lenience: Lenience,
    purgeTheWicked: PurgeTheWicked,
    atonementApplicatorBreakdown: AtonementApplicatorBreakdown,
    solaceVsShieldDiscipline: SolaceVsShieldDiscipline,
    enduringLuminescense: EnduringLuminescense,
    crystallineReflection: CrystallineReflection,
    powerWordRadiance: PowerWordRadiance,

    // Spells (talents and traits):
    twistOfFate: TwistOfFate,
    castigation: Castigation,
    atonement: Atonement,
    evangelism: Evangelism,
    desperatePrayer: DesperatePrayer,
    contrition: Contrition,
    grace: Grace,
    sinsOfTheMany: SinsOfTheMany,
    schism: Schism,
    shadowCovenant: ShadowCovenant,
    mindgames: Mindgames,
    harshDiscipline: HarshDiscipline,
    indemnity: Indemnity,
    expiation: Expiation,
    powerWordShield: PowerWordShield,
    twilightEqilibrium: TwilightEquilibrium,
    twinsOfTheSunPriestess: TwinsOfTheSunPriestess,
    painAndSuffering: PainAndSuffering,
    throesOfPain: ThroesOfPain,
    maliciousIntent: MaliciousIntent,
    evangelismAnalysis: EvangelismAnalysis,
    blazeOfLight: BlazeOfLight,
    selfAtonementAnalyzer: SelfAtonementAnalyzer,
    protectiveLight: ProtectiveLight,
    resplendentLight: ResplendentLight,
    raptureAnalysis: RaptureAnalysis,
    abyssalReverie: AbyssalReverie,
    wealAndWoe: WealAndWoe,
  };
  static guide = Guide;
}

export default CombatLogParser;
