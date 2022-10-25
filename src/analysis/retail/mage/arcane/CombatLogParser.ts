import {
  ArcaneIntellect,
  CancelledCasts,
  DivertedEnergy,
  ElementalBarrier,
  GroundingSurge,
  MirrorImage,
  RuneOfPower,
  ShiftingPower,
  TempestBarrier,
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
import ArcanePowerActiveTime from './core/ArcanePowerActiveTime';
import ArcanePowerCasts from './core/ArcanePowerCasts';
import ArcanePowerMana from './core/ArcanePowerMana';
import ArcanePowerPreReqs from './core/ArcanePowerPreReqs';

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
import MasterOfTime from './talents/MasterOfTime';
import RadiantSpark from './talents/RadiantSpark';
import RuleOfThrees from './talents/RuleOfThrees';
import TimeAnomaly from './talents/TimeAnomaly';

//Normalizers
import ArcaneChargesNormalizer from './normalizers/ArcaneCharges';
import ArcanePowerNormalizer from './normalizers/ArcanePower';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Normalizers
    arcaneChargesNormalizer: ArcaneChargesNormalizer,
    arcanePowerNormalizer: ArcanePowerNormalizer,
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
    arcanePowerPreReqs: ArcanePowerPreReqs,
    arcanePowerMana: ArcanePowerMana,
    arcanePowerCasts: ArcanePowerCasts,
    arcanePowerActiveTime: ArcanePowerActiveTime,
    arcaneMissiles: ArcaneMissiles,

    // Talents
    arcaneFamiliar: ArcaneFamiliar,
    arcaneIntellect: ArcaneIntellect,
    runeOfPower: RuneOfPower,
    arcaneOrb: ArcaneOrb,
    ruleOfThrees: RuleOfThrees,
    timeAnomaly: TimeAnomaly,
    masterOfTime: MasterOfTime,
    arcaneEcho: ArcaneEcho,
    arcaneHarmony: ArcaneHarmony,
    arcaneBombardment: ArcaneBombardment,
    shiftingPower: ShiftingPower,
    radiantSpark: RadiantSpark,
    divertedEnergy: DivertedEnergy,
    groundingSurge: GroundingSurge,
    tempestBarrier: TempestBarrier,
    mirrorImage: MirrorImage,
    elementalBarrier: ElementalBarrier,
  };
}

export default CombatLogParser;
