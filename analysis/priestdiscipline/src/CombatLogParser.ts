import CoreCombatLogParser from 'parser/core/CombatLogParser';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';

import {
  BoonOfTheAscended,
  DesperatePrayer,
  FaeGuardians,
  ShadowfiendNormalizer,
  TwinsOfTheSunPriestess,
  UnholyNova,
} from '@wowanalyzer/priest';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './constants';
import Abilities from './modules/Abilities';
import AbilityTracker from './modules/core/AbilityTracker';
import AtonementAnalyzer from './modules/core/AtonementAnalyzer';
import Channeling from './modules/core/Channeling';
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
import Exaltation from './modules/shadowlands/conduits/Exaltation';
import ShatteredPerceptions from './modules/shadowlands/conduits/ShatteredPerceptions';
import ShiningRadiance from './modules/shadowlands/conduits/ShiningRadiance';
import Mindgames from './modules/shadowlands/covenant/Mindgames';
import ClarityOfMind from './modules/shadowlands/legendaries/ClarityOfMind';
import ThePenitentOne from './modules/shadowlands/legendaries/ThePenitentOne';
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
import PowerWordRadianceNormalizer from './normalizers/PowerWordRadianceNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Normalizers
    atonementSuccessiveDamage: AtonementSuccessiveDamageNormalizer,
    shadowfiendNormalizer: ShadowfiendNormalizer,
    powerWordRadianceNormalizer: PowerWordRadianceNormalizer,

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

    // Conduits
    shiningRadiance: ShiningRadiance,
    exaltation: Exaltation,
    shatteredPerceptions: ShatteredPerceptions,

    // Legendaries
    twinsOfTheSunPriestess: TwinsOfTheSunPriestess,
    thePenitentOne: ThePenitentOne,
    clarityOfMind: ClarityOfMind,
  };
}

export default CombatLogParser;
