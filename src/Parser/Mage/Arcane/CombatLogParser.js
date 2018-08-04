import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Abilities from './Modules/Features/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import Channeling from './Modules/Features/Channeling';

import Mana from './Modules/ManaChart/Mana';
import ManaValues from './Modules/ManaChart/ManaValues';

import ArcaneCharges from './Normalizers/ArcaneCharges';

import ArcaneChargeTracker from './Modules/Features/ArcaneChargeTracker';
import ArcanePower from './Modules/Features/ArcanePower';

import ArcaneFamiliar from './Modules/Features/ArcaneFamiliar';

import CancelledCasts from '../Shared/Modules/Features/CancelledCasts';
import MirrorImage from '../Shared/Modules/Features/MirrorImage';
import ArcaneIntellect from '../Shared/Modules/Features/ArcaneIntellect';
import RuneOfPower from '../Shared/Modules/Features/RuneOfPower';
import ArcaneOrb from './Modules/Features/ArcaneOrb';
import RuleOfThrees from './Modules/Features/RuleOfThrees';



class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Normalizers
    arcaneCharges: ArcaneCharges,
    
    // Features
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

    // Talents
    arcaneFamiliar: ArcaneFamiliar,
    mirrorImage: MirrorImage,
    arcaneIntellect: ArcaneIntellect,
    runeOfPower: RuneOfPower,
    arcaneOrb: ArcaneOrb,
    ruleOfThrees: RuleOfThrees,
  };
}

export default CombatLogParser;
