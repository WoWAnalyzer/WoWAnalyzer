import CoreCombatLogParser from 'parser/core/CombatLogParser';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
import LucidDreams from 'parser/shared/modules/spells/bfa/essences/LucidDreamsHealers';

import AtonementSuccessiveDamageNormalizer from './normalizers/AtonementSuccessiveDamage';
import ShadowfiendNormalizer from '../shared/normalizers/ShadowfiendNormalizer';
import PowerWordRadianceNormalizer from './normalizers/PowerWordRadianceNormalizer';

import Abilities from './modules/Abilities';
import SpellUsable from './modules/core/SpellUsable';
import SpellManaCost from './modules/core/SpellManaCost';
import AbilityTracker from './modules/core/AbilityTracker';
import Channeling from './modules/core/Channeling';
import GlobalCooldown from './modules/core/GlobalCooldown';
import AtonementAnalyzer from './modules/core/AtonementAnalyzer';

import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/Checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import PowerWordShieldWasted from './modules/features/PowerWordShieldWasted';
import AtonementApplicationSource from './modules/features/AtonementApplicationSource';
import AtonementDamageSource from './modules/features/AtonementDamageSource';
import AtonementHealingDone from './modules/features/AtonementHealingDone';
import PowerWordBarrier from './modules/features/PowerWordBarrier';
import Lenience from './modules/spells/Lenience';
import PurgeTheWicked from './modules/features/PurgeTheWicked';
import AtonementApplicatorBreakdown from './modules/features/AtonementApplicatorBreakdown';

import TwistOfFate from './modules/spells/TwistOfFate';
import Castigation from './modules/spells/Castigation';
import Atonement from './modules/spells/Atonement';
import Evangelism from './modules/spells/Evangelism';
import Penance from './modules/spells/Penance';
import LuminousBarrier from './modules/spells/LuminousBarrier';
import DesperatePrayer from '../shared/modules/features/DesperatePrayer';
import Contrition from './modules/spells/Contrition';
import Grace from './modules/spells/Grace';
import Schism from './modules/spells/Schism';

import DeathThroes from './modules/azeritetraits/DeathThroes';
import DepthOfTheShadows from './modules/azeritetraits/DepthOfTheShadows';
import EnduringLuminescence from './modules/azeritetraits/EnduringLuminescence';
import SinsOfTheMany from './modules/spells/SinsOfTheMany';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './constants';

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
    luminousBarrier: LuminousBarrier,
    desperatePrayer: DesperatePrayer,
    contrition: Contrition,
    grace: Grace,
    schism: Schism,
    sinsOfTheMany: SinsOfTheMany,

    // Essences
    lucidDreams: LucidDreams,

    // Azerite Traits
    enduringLuminescence: EnduringLuminescence,
    depthOfTheShadows: DepthOfTheShadows,
    deathThroes: DeathThroes,
  };
}

export default CombatLogParser;
