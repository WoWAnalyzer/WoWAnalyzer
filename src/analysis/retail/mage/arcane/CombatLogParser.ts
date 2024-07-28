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
import Clearcasting from './core/Clearcasting';
import ArcaneBarrage from './core/ArcaneBarrage';
import ArcaneOrb from './talents/ArcaneOrb';
import ArcaneSurge from './core/ArcaneSurge';

//Guide
import Guide from './Guide';
import ArcaneSurgeGuide from './guide/ArcaneSurge';
import TouchOfTheMagiGuide from './guide/TouchOfTheMagi';
import ArcaneBarrageGuide from './guide/ArcaneBarrage';
import ArcaneOrbGuide from './guide/ArcaneOrb';
import ClearcastingGuide from './guide/Clearcasting';
import NetherPrecisionGuide from './guide/NetherPrecision';
import SiphonStormGuide from './guide/SiphonStorm';
import ArcaneTempoGuide from './guide/ArcaneTempo';

//Items

//Mana Chart
import Mana from './ManaChart/Mana';
import ManaValues from './ManaChart/ManaValues';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';

//Talents
import ArcaneBombardment from './talents/ArcaneBombardment';
import ArcaneEcho from './talents/ArcaneEcho';
import ArcaneHarmony from './talents/ArcaneHarmony';
import TouchOfTheMagi from './talents/TouchOfTheMagi';
import NetherPrecision from './talents/NetherPrecision';
import SiphonStorm from './talents/SiphonStorm';
import ArcaneTempo from './talents/ArcaneTempo';

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
    manaLevelChart: ManaLevelChart,
    cancelledCasts: CancelledCasts,
    arcaneChargeTracker: ArcaneChargeTracker,
    arcaneSurge: ArcaneSurge,
    clearcasting: Clearcasting,
    arcaneBarrage: ArcaneBarrage,
    arcaneOrb: ArcaneOrb,

    // Guide
    arcaneSurgeGuide: ArcaneSurgeGuide,
    touchOfTheMagiGuide: TouchOfTheMagiGuide,
    arcaneBarrageGuide: ArcaneBarrageGuide,
    arcaneOrbGuide: ArcaneOrbGuide,
    clearcastingGuide: ClearcastingGuide,
    netherPrecisionGuide: NetherPrecisionGuide,
    siphonStormGuide: SiphonStormGuide,
    arcaneTempoGuide: ArcaneTempoGuide,

    // Talents - Arcane
    arcaneEcho: ArcaneEcho,
    arcaneHarmony: ArcaneHarmony,
    arcaneBombardment: ArcaneBombardment,
    shiftingPower: ShiftingPower,
    touchOfTheMagi: TouchOfTheMagi,
    netherPrecision: NetherPrecision,
    siphonStorm: SiphonStorm,
    arcaneTempo: ArcaneTempo,

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
  static guide = Guide;
}

export default CombatLogParser;
