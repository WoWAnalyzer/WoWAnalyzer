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
import Abilities from './core/Abilities';
import AlwaysBeCasting from './core/AlwaysBeCasting';
import Buffs from './core/Buffs';
import CooldownThroughputTracker from './core/CooldownThroughputTracker';
import ArcaneChargeTracker from './core/ArcaneChargeTracker';
import Clearcasting from './core/Clearcasting';
import ArcaneMissiles from './core/ArcaneMissiles';
import ArcaneBarrage from './core/ArcaneBarrage';
import ArcaneOrb from './core/ArcaneOrb';
import ArcaneSurge from './core/ArcaneSurge';

//Guide
import Guide from './Guide';
import ArcaneSurgeGuide from './guide/ArcaneSurge';
import TouchOfTheMagiGuide from './guide/TouchOfTheMagi';
import ShiftingPowerGuide from './guide/ShiftingPower';
import ArcaneMissilesGuide from './guide/ArcaneMissiles';
import ArcaneBarrageGuide from './guide/ArcaneBarrage';
import ArcaneOrbGuide from './guide/ArcaneOrb';
import PresenceOfMindGuide from './guide/PresenceOfMind';
import SupernovaGuide from './guide/Supernova';
import ClearcastingGuide from './guide/Clearcasting';
import NetherPrecisionGuide from './guide/NetherPrecision';
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
import PresenceOfMind from './talents/PresenceOfMind';
import ShiftingPowerArcane from './talents/ShiftingPower';
import Supernova from '../shared/Supernova';
import NetherPrecision from './talents/NetherPrecision';
import ArcaneTempo from './talents/ArcaneTempo';

//Normalizers
import ArcaneChargesNormalizer from './normalizers/ArcaneCharges';
import ArcaneSurgeNormalizer from './normalizers/ArcaneSurge';
import NetherPrecisionNormalizer from './normalizers/NetherPrecision';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Normalizers
    netherPrecisionNormalizer: NetherPrecisionNormalizer,
    arcaneChargesNormalizer: ArcaneChargesNormalizer,
    arcaneSurgeNormalizer: ArcaneSurgeNormalizer,
    castLinkNormalizer: CastLinkNormalizer,

    //Core
    buffs: Buffs,
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    arcaneChargeTracker: ArcaneChargeTracker,
    channeling: Channeling,
    mana: Mana,
    manaValues: ManaValues,
    manaLevelChart: ManaLevelChart,
    cancelledCasts: CancelledCasts,
    arcaneSurge: ArcaneSurge,
    clearcasting: Clearcasting,
    arcaneMissiles: ArcaneMissiles,
    arcaneBarrage: ArcaneBarrage,
    arcaneOrb: ArcaneOrb,

    // Guide
    arcaneSurgeGuide: ArcaneSurgeGuide,
    touchOfTheMagiGuide: TouchOfTheMagiGuide,
    shiftingPowerGuide: ShiftingPowerGuide,
    arcaneMissilesGuide: ArcaneMissilesGuide,
    arcaneBarrageGuide: ArcaneBarrageGuide,
    presenceOfMindGuide: PresenceOfMindGuide,
    arcaneOrbGuide: ArcaneOrbGuide,
    supernovaGuide: SupernovaGuide,
    clearcastingGuide: ClearcastingGuide,
    netherPrecisionGuide: NetherPrecisionGuide,
    arcaneTempoGuide: ArcaneTempoGuide,

    //Talents - Shared
    divertedEnergy: DivertedEnergy,
    quickWitted: QuickWitted,
    tempestBarrier: TempestBarrier,
    mirrorImage: MirrorImage,
    presenceOfMind: PresenceOfMind,
    supernova: Supernova,
    shiftingPower: ShiftingPower,
    elementalBarrier: ElementalBarrier,
    timeAnomaly: TimeAnomaly,
    masterOfTime: MasterOfTime,
    arcaneIntellect: ArcaneIntellect,

    // Talents - Arcane
    arcaneEcho: ArcaneEcho,
    arcaneHarmony: ArcaneHarmony,
    arcaneBombardment: ArcaneBombardment,
    shiftingPowerArcane: ShiftingPowerArcane,
    touchOfTheMagi: TouchOfTheMagi,
    netherPrecision: NetherPrecision,
    arcaneTempo: ArcaneTempo,
  };
  static guide = Guide;
}

export default CombatLogParser;
