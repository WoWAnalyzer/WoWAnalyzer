import {
  ArcaneIntellect,
  CancelledCasts,
  DivertedEnergy,
  ElementalBarrier,
  QuickWitted,
  MirrorImage,
  ShiftingPower,
  TempestBarrier,
  MasterOfTime,
  TimeAnomaly,
} from 'analysis/retail/mage/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import Channeling from 'parser/shared/normalizers/Channeling';

//Core
import Checklist from './Checklist/Module';
import Abilities from './core/Abilities';
import AlwaysBeCasting from './core/AlwaysBeCasting';
import Buffs from './core/Buffs';
import CooldownThroughputTracker from './core/CooldownThroughputTracker';
import ArcaneChargeTracker from './core/ArcaneChargeTracker';
import ArcaneMissiles from './core/ArcaneMissiles';
import ArcaneSurgeMana from './core/ArcaneSurgeMana';
import ArcaneSurgePreReqs from './core/ArcaneSurgePreReqs';

//Items

//Mana Chart
import Mana from './ManaChart/Mana';
import ManaValues from './ManaChart/ManaValues';

//Talents
import ArcaneBombardment from './talents/ArcaneBombardment';
import ArcaneEcho from './talents/ArcaneEcho';
import ArcaneFamiliar from './talents/ArcaneFamiliar';
import ArcaneHarmony from './talents/ArcaneHarmony';
import ArcaneOrb from './talents/ArcaneOrb';
import RadiantSpark from './talents/RadiantSpark';
import RuleOfThrees from './talents/RuleOfThrees';
import TouchOfTheMagi from './talents/TouchOfTheMagi';

//Normalizers
import ArcaneChargesNormalizer from './normalizers/ArcaneCharges';
import ArcaneSurgeNormalizer from './normalizers/ArcaneSurge';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Normalizers
    arcaneChargesNormalizer: ArcaneChargesNormalizer,
    arcaneSurgeNormalizer: ArcaneSurgeNormalizer,
    castLinkNormalizer: CastLinkNormalizer,

    //Core
    checklist: Checklist,
    buffs: Buffs,
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    channeling: Channeling,
    mana: Mana,
    manaValues: ManaValues,
    cancelledCasts: CancelledCasts,
    arcaneChargeTracker: ArcaneChargeTracker,
    arcaneSurgePreReqs: ArcaneSurgePreReqs,
    arcaneSurgeMana: ArcaneSurgeMana,
    arcaneMissiles: ArcaneMissiles,

    // Talents - Arcane
    arcaneFamiliar: ArcaneFamiliar,
    arcaneOrb: ArcaneOrb,
    ruleOfThrees: RuleOfThrees,
    arcaneEcho: ArcaneEcho,
    arcaneHarmony: ArcaneHarmony,
    arcaneBombardment: ArcaneBombardment,
    shiftingPower: ShiftingPower,
    radiantSpark: RadiantSpark,
    touchOfTheMagi: TouchOfTheMagi,

    //Talents - Shared
    divertedEnergy: DivertedEnergy,
    quickWitted: QuickWitted,
    tempestBarrier: TempestBarrier,
    mirrorImage: MirrorImage,
    elementalBarrier: ElementalBarrier,
    timeAnomaly: TimeAnomaly,
    masterOfTime: MasterOfTime,
    arcaneIntellect: ArcaneIntellect,
  };
}

export default CombatLogParser;
