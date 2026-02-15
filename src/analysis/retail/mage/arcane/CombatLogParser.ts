import {
  ArcaneIntellect,
  CancelledCasts,
  ElementalBarrier,
  QuickWitted,
  MasterOfTime,
  IceBlock,
  IceCold,
} from 'analysis/retail/mage/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import Channeling from 'parser/shared/normalizers/Channeling';

// Core Analyzers
import Abilities from './core/Abilities';
import AlwaysBeCasting from './core/AlwaysBeCasting';
import Buffs from './core/Buffs';
import CooldownThroughputTracker from './core/CooldownThroughputTracker';
import ArcaneChargeTracker from './core/ArcaneChargeTracker';
import Clearcasting from './analyzers/Clearcasting';
import ArcaneMissiles from './analyzers/ArcaneMissiles';
import ArcaneBarrage from './analyzers/ArcaneBarrage';
import ArcaneOrb from './analyzers/ArcaneOrb';
import ArcaneSurge from './analyzers/ArcaneSurge';

//Guide
import Guide from './Guide';
import ArcaneSurgeGuide from './guide/ArcaneSurge';
import TouchOfTheMagiGuide from './guide/TouchOfTheMagi';
import ArcaneMissilesGuide from './guide/ArcaneMissiles';
import ArcaneBarrageGuide from './guide/ArcaneBarrage';
import ArcaneOrbGuide from './guide/ArcaneOrb';
import PresenceOfMindGuide from './guide/PresenceOfMind';
import ClearcastingGuide from './guide/Clearcasting';

//Items

// Mana Chart - replaced with simplified guide
import ManaChart from './guide/ManaChart';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';

import ArcaneEcho from './analyzers/ArcaneEcho';
import TouchOfTheMagi from './analyzers/TouchOfTheMagi';
import PresenceOfMind from './analyzers/PresenceOfMind';

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

    //Analyzers
    buffs: Buffs,
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    arcaneChargeTracker: ArcaneChargeTracker,
    channeling: Channeling,
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
    arcaneMissilesGuide: ArcaneMissilesGuide,
    arcaneBarrageGuide: ArcaneBarrageGuide,
    presenceOfMindGuide: PresenceOfMindGuide,
    arcaneOrbGuide: ArcaneOrbGuide,
    clearcastingGuide: ClearcastingGuide,
    manaChart: ManaChart,

    //Talents - Shared
    quickWitted: QuickWitted,
    presenceOfMind: PresenceOfMind,
    elementalBarrier: ElementalBarrier,
    masterOfTime: MasterOfTime,
    arcaneIntellect: ArcaneIntellect,

    // Defensives - Shared
    iceBlock: IceBlock,
    iceCold: IceCold,

    // Talents - Arcane
    arcaneEcho: ArcaneEcho,
    touchOfTheMagi: TouchOfTheMagi,
  };
  static guide = Guide;
}

export default CombatLogParser;
