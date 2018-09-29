import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/core/modules/DamageDone';

import AlwaysBeCasting from './modules/Features/AlwaysBeCasting';
import Abilities from './modules/Features/Abilities';
import CooldownThroughputTracker from './modules/Features/CooldownThroughputTracker';
import Channeling from './modules/Features/Channeling';
import Checklist from './modules/Checklist/Module';

import Mana from './modules/ManaChart/Mana';
import ManaValues from './modules/ManaChart/ManaValues';

import ArcaneCharges from './normalizers/ArcaneCharges';

import ArcaneChargeTracker from './modules/Features/ArcaneChargeTracker';
import ArcanePower from './modules/Features/ArcanePower';
import ArcaneMissiles from './modules/Features/ArcaneMissiles';

import ArcaneFamiliar from './modules/Features/ArcaneFamiliar';

import CancelledCasts from '../shared/modules/features/CancelledCasts';
import MirrorImage from '../shared/modules/features/MirrorImage';
import ArcaneIntellect from '../shared/modules/features/ArcaneIntellect';
import RuneOfPower from '../shared/modules/features/RuneOfPower';
import ArcaneOrb from './modules/Features/ArcaneOrb';
import RuleOfThrees from './modules/Features/RuleOfThrees';
import TimeAnomaly from './modules/Features/TimeAnomaly';



class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Normalizers
    arcaneCharges: ArcaneCharges,
    
    // Features
    checklist: Checklist,
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    damageDone: [DamageDone, { showStatistic: true }],
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
