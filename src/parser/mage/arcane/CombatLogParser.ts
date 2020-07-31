import CoreCombatLogParser from 'parser/core/CombatLogParser';

import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Abilities from './modules/features/Abilities';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Channeling from './modules/features/Channeling';
import Checklist from './modules/Checklist/Module';
import Buffs from './modules/features/Buffs';

import Mana from './modules/ManaChart/Mana';
import ManaValues from './modules/ManaChart/ManaValues';

import ArcaneCharges from './normalizers/ArcaneCharges';
import ArcanePowerNormalizer from './normalizers/ArcanePower';

import ArcaneChargeTracker from './modules/features/ArcaneChargeTracker';
import ArcanePower from './modules/features/ArcanePower';
import ArcaneMissiles from './modules/features/ArcaneMissiles';

import ArcaneFamiliar from './modules/features/ArcaneFamiliar';

import CancelledCasts from '../shared/modules/features/CancelledCasts';
import MirrorImage from '../shared/modules/features/MirrorImage';
import ArcaneIntellect from '../shared/modules/features/ArcaneIntellect';
import RuneOfPower from '../shared/modules/features/RuneOfPower';
import ArcaneOrb from './modules/features/ArcaneOrb';
import RuleOfThrees from './modules/features/RuleOfThrees';
import TimeAnomaly from './modules/features/TimeAnomaly';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Normalizers
    arcaneCharges: ArcaneCharges,
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
    arcaneMissiles: ArcaneMissiles,

    // Talents
    arcaneFamiliar: ArcaneFamiliar,
    mirrorImage: MirrorImage,
    arcaneIntellect: ArcaneIntellect,
    runeOfPower: RuneOfPower,
    arcaneOrb: ArcaneOrb,
    ruleOfThrees: RuleOfThrees,
    timeAnomaly: TimeAnomaly,
  };
}

export default CombatLogParser;
