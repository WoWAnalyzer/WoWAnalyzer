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

import CoreCombatLogParser from 'parser/core/CombatLogParser';

//Normalizers
import ArcaneChargesNormalizer from './normalizers/ArcaneCharges';
import ArcanePowerNormalizer from './normalizers/ArcanePower';

//Features
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Abilities from './modules/features/Abilities';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Channeling from './modules/features/Channeling';
import Checklist from './modules/Checklist/Module';
import Buffs from './modules/features/Buffs';
import Mana from './modules/ManaChart/Mana';
import ManaValues from './modules/ManaChart/ManaValues';
import ArcaneChargeTracker from './modules/features/ArcaneChargeTracker';
import ArcanePower from './modules/features/ArcanePower';
import ArcanePowerActiveTime from './modules/features/ArcanePowerActiveTime';
import ArcaneMissiles from './modules/features/ArcaneMissiles';

//Talents
import ArcaneOrb from './modules/talents/ArcaneOrb';
import RuleOfThrees from './modules/talents/RuleOfThrees';
import TimeAnomaly from './modules/talents/TimeAnomaly';
import ArcaneFamiliar from './modules/talents/ArcaneFamiliar';
import MasterOfTime from './modules/talents/MasterOfTime';
import ArcaneEcho from './modules/talents/ArcaneEcho';

//Legendaries
import ArcaneHarmony from './modules/items/ArcaneHarmony';
import ArcaneBombardment from './modules/items/ArcaneBombardment';

//Conduits
import ArcaneProdigy from './modules/items/ArcaneProdigy';
import ArtificeOfTheArchmage from './modules/items/ArtificeOfTheArchmage';

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
    arcanePower: ArcanePower,
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
