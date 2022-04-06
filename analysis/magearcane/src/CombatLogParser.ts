import CoreCombatLogParser from 'parser/core/CombatLogParser';
import Channeling from 'parser/shared/normalizers/Channeling';

import {
  ArcaneIntellect,
  CancelledCasts,
  DivertedEnergy,
  ElementalBarrier,
  GroundingSurge,
  IreOfTheAscended,
  MirrorImage,
  RuneOfPower,
  ShiftingPower,
  SiphonedMalice,
  TempestBarrier,
} from '@wowanalyzer/mage';

import Checklist from './modules/Checklist/Module';
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import ArcaneChargeTracker from './modules/features/ArcaneChargeTracker';
import ArcaneMissiles from './modules/features/ArcaneMissiles';
import ArcanePowerActiveTime from './modules/features/ArcanePowerActiveTime';
import ArcanePowerCasts from './modules/features/ArcanePowerCasts';
import ArcanePowerMana from './modules/features/ArcanePowerMana';
import ArcanePowerPreReqs from './modules/features/ArcanePowerPreReqs';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import RadiantSpark from './modules/features/RadiantSpark';
import ArcaneBombardment from './modules/items/ArcaneBombardment';
import ArcaneHarmony from './modules/items/ArcaneHarmony';
import ArcaneProdigy from './modules/items/ArcaneProdigy';
import ArtificeOfTheArchmage from './modules/items/ArtificeOfTheArchmage';
import Mana from './modules/ManaChart/Mana';
import ManaValues from './modules/ManaChart/ManaValues';
import ArcaneEcho from './modules/talents/ArcaneEcho';
import ArcaneFamiliar from './modules/talents/ArcaneFamiliar';
import ArcaneOrb from './modules/talents/ArcaneOrb';
import MasterOfTime from './modules/talents/MasterOfTime';
import RuleOfThrees from './modules/talents/RuleOfThrees';
import TimeAnomaly from './modules/talents/TimeAnomaly';
import ArcaneChargesNormalizer from './normalizers/ArcaneCharges';
import ArcanePowerNormalizer from './normalizers/ArcanePower';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Normalizers
    arcaneChargesNormalizer: ArcaneChargesNormalizer,
    arcanePowerNormalizer: ArcanePowerNormalizer,

    // Features
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
    mirrorImage: MirrorImage,
    elementalBarrier: ElementalBarrier,

    // Talents
    arcaneFamiliar: ArcaneFamiliar,
    arcaneIntellect: ArcaneIntellect,
    runeOfPower: RuneOfPower,
    arcaneOrb: ArcaneOrb,
    ruleOfThrees: RuleOfThrees,
    timeAnomaly: TimeAnomaly,
    masterOfTime: MasterOfTime,
    arcaneEcho: ArcaneEcho,

    //Legendaries
    arcaneHarmony: ArcaneHarmony,
    arcaneBombardment: ArcaneBombardment,

    //Covenants
    shiftingPower: ShiftingPower,
    radiantSpark: RadiantSpark,

    //Conduits
    arcaneProdigy: ArcaneProdigy,
    artificeOfTheArchmage: ArtificeOfTheArchmage,
    divertedEnergy: DivertedEnergy,
    groundingSurge: GroundingSurge,
    ireOfTheAscended: IreOfTheAscended,
    tempestBarrier: TempestBarrier,
    siphonedMalice: SiphonedMalice,
  };
}

export default CombatLogParser;
