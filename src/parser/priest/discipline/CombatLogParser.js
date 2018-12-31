import CoreCombatLogParser from 'parser/core/CombatLogParser';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import HealingDone from 'parser/shared/modules/HealingDone';

import AtonementSuccessiveDamageNormalizer from './normalizers/AtonementSuccessiveDamage';
import EstelNormalizer from './normalizers/EstelNormalizer';
import ShadowfiendNormalizer from './normalizers/ShadowfiendNormalizer';
import PowerWordRadianceNormalizer from './normalizers/PowerWordRadianceNormalizer';

import Abilities from './modules/Abilities';
import SpellUsable from './modules/core/SpellUsable';
import SpellManaCost from './modules/core/SpellManaCost';
import AbilityTracker from './modules/core/AbilityTracker';
import Channeling from './modules/core/Channeling';
import GlobalCooldown from './modules/core/GlobalCooldown';

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

import CordOfMaiev from './modules/items/CordOfMaiev';
import Skjoldr from './modules/items/Skjoldr';
import Xalan from './modules/items/Xalan';
import NeroBandOfPromises from './modules/items/NeroBandOfPromises';
import TarnishedSentinelMedallion from './modules/items/TarnishedSentinelMedallion';
import MarchOfTheLegion from './modules/items/MarchOfTheLegion';
import Estel from './modules/items/Estel';
import SoulOfTheHighPriest from './modules/items/SoulOfTheHighPriest';

import TwistOfFate from './modules/spells/TwistOfFate';
import Castigation from './modules/spells/Castigation';
import Atonement from './modules/spells/Atonement';
import Evangelism from './modules/spells/Evangelism';
import Penance from './modules/spells/Penance';
import TouchOfTheGrave from './modules/spells/TouchOfTheGrave';
import LuminousBarrier from './modules/spells/LuminousBarrier';
import DesperatePrayer from '../shared/modules/features/DesperatePrayer';
import Contrition from './modules/spells/Contrition';
import Grace from './modules/spells/Grace';
import Schism from './modules/spells/Schism';

import DepthOfTheShadows from './modules/azeritetraits/DepthOfTheShadows';
import SinsOfTheMany from './modules/spells/SinsOfTheMany';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './constants';

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Normalizers
    atonementSuccessiveDamage: AtonementSuccessiveDamageNormalizer,
    estelNormalizer: EstelNormalizer,
    shadowfiendNormalizer: ShadowfiendNormalizer,
    powerWordRadianceNormalizer: PowerWordRadianceNormalizer,

    healingDone: [HealingDone, { showStatistic: true }],
    spellUsable: SpellUsable,
    spellManaCost: SpellManaCost,
    abilityTracker: AbilityTracker,
    lowHealthHealing: LowHealthHealing,
    abilities: Abilities,
    channeling: Channeling,
    globalCooldown: GlobalCooldown,

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

    // Items:
    cordOfMaiev: CordOfMaiev,
    skjoldr: Skjoldr,
    xalan: Xalan,
    neroBandOfPromises: NeroBandOfPromises,
    tarnishedSentinelMedallion: TarnishedSentinelMedallion,
    marchOfTheLegion: MarchOfTheLegion,
    estel: Estel,
    soulOfTheHighPriest: SoulOfTheHighPriest,

    // Spells (talents and traits):
    twistOfFate: TwistOfFate,
    castigation: Castigation,
    atonement: Atonement,
    evangelism: Evangelism,
    touchOfTheGrave: TouchOfTheGrave,
    luminousBarrier: LuminousBarrier,
    desperatePrayer: DesperatePrayer,
    contrition: Contrition,
    grace: Grace,
    schism: Schism,
    sinsOfTheMany: SinsOfTheMany,

    // Azerite Traits
    depthOfTheShadows: DepthOfTheShadows,
  };
}

export default CombatLogParser;
