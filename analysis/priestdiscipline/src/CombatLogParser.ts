import CoreCombatLogParser from 'parser/core/CombatLogParser';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
import Channeling from 'parser/shared/normalizers/Channeling';

import {
  BoonOfTheAscended,
  DesperatePrayer,
  FaeGuardians,
  ShadowfiendNormalizer,
  TranslucentImage,
  TwinsOfTheSunPriestess,
  UnholyNova,
} from '@wowanalyzer/priest';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './constants';
import Guide from './Guide';
import Abilities from './modules/Abilities';
import AbilityTracker from './modules/core/AbilityTracker';
import AtonementAnalyzer from './modules/core/AtonementAnalyzer';
import GlobalCooldown from './modules/core/GlobalCooldown';
import SpellManaCost from './modules/core/SpellManaCost';
import SpellUsable from './modules/core/SpellUsable';
import SpiritShell from './modules/core/SpiritShell';
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
import Exaltation from './modules/shadowlands/conduits/Exaltation';
import ExaltationEvang from './modules/shadowlands/conduits/ExaltationEvang';
import RabidShadows from './modules/shadowlands/conduits/RabidShadows';
import ShatteredPerceptions from './modules/shadowlands/conduits/ShatteredPerceptions';
import ShiningRadiance from './modules/shadowlands/conduits/ShiningRadiance';
import SwiftPenitence from './modules/shadowlands/conduits/SwiftPenitence';
import Mindgames from './modules/shadowlands/covenant/Mindgames';
import ClarityOfMind from './modules/shadowlands/legendaries/ClarityOfMind';
import ClarityOfMindEvang from './modules/shadowlands/legendaries/ClarityOfMindEvang';
import ShadowWordManipulation from './modules/shadowlands/legendaries/ShadowWordManipulation';
import ThePenitentOne from './modules/shadowlands/legendaries/ThePenitentOne';
import SoothingShade from './modules/shadowlands/soulbinds/SoothingShade';
import ManifestedTwilight from './modules/shadowlands/tier/ManifestedTwilight';
import Atonement from './modules/spells/Atonement';
import Castigation from './modules/spells/Castigation';
import Contrition from './modules/spells/Contrition';
import Evangelism from './modules/spells/Evangelism';
import Grace from './modules/spells/Grace';
import Lenience from './modules/spells/Lenience';
import Penance from './modules/spells/Penance';
import Schism from './modules/spells/Schism';
import SinsOfTheMany from './modules/spells/SinsOfTheMany';
import TwistOfFate from './modules/spells/TwistOfFate';
import AtonementSuccessiveDamageNormalizer from './normalizers/AtonementSuccessiveDamage';
import ManifestedTwilightNormalizer from './normalizers/ManifestedTwilightNormalizer';
import PowerWordRadianceNormalizer from './normalizers/PowerWordRadianceNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Normalizers
    atonementSuccessiveDamage: AtonementSuccessiveDamageNormalizer,
    shadowfiendNormalizer: ShadowfiendNormalizer,
    powerWordRadianceNormalizer: PowerWordRadianceNormalizer,
    manifestedTwilightNormalizer: ManifestedTwilightNormalizer,

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
    spiritShell: SpiritShell,

    // Covenants
    unholyNova: UnholyNova,
    mindgames: Mindgames,
    boonOfTheAscended: BoonOfTheAscended,
    faeGuardians: FaeGuardians,
    SoothingShade: SoothingShade,

    // Conduits
    shiningRadiance: ShiningRadiance,
    exaltation: Exaltation,
    exaltationEvang: ExaltationEvang,
    shatteredPerceptions: ShatteredPerceptions,
    swiftPenitence: SwiftPenitence,
    translucentImage: TranslucentImage,
    RabidShadows: RabidShadows,

    // Legendaries
    twinsOfTheSunPriestess: TwinsOfTheSunPriestess,
    thePenitentOne: ThePenitentOne,
    clarityOfMind: ClarityOfMind,
    clarityOfMindEvang: ClarityOfMindEvang,
    shadowWordManipulation: ShadowWordManipulation,

    // Items
    manifestedTwilight: ManifestedTwilight,

    // Problems
    // rapture: Rapture,
  };

  static guide = Guide;
}

export default CombatLogParser;
