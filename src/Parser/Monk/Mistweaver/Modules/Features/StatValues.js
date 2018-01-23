

import BaseHealerStatValues from 'Parser/Core/Modules/Features/BaseHealerStatValues';
import STAT from 'Parser/Core/Modules/Features/STAT';
import Combatants from 'Parser/Core/Modules/Combatants';

import CritEffectBonus from 'Parser/Core/Modules/Helpers/CritEffectBonus';
import StatTracker from 'Parser/Core/Modules/StatTracker';

import SPELL_INFO from './StatValuesSpellInfo';

/**
 * Mistweaver Monk Stat Values Methodology
 *
 */
class StatValues extends BaseHealerStatValues {
  static dependencies = {
    combatants: Combatants,
    critEffectBonus: CritEffectBonus,
    statTracker: StatTracker,
  };

  spellInfo = SPELL_INFO;

  _mastery(event, healVal) {
    if (healVal.overheal) {
      // If a spell overheals, it could not have healed for more. Seeing as Mastery only adds HP on top of the existing heal we can skip it as increasing the power of this heal would only be more overhealing.
      return 0;
    }

    return 0;
  }

  
  _prepareResults() {
    return [
      STAT.INTELLECT,
      STAT.CRITICAL_STRIKE,
      {
        stat: STAT.HASTE_HPCT,
        tooltip: `
          HPCT stands for "Healing per Cast Time". This is the max value that 1% Haste would be worth if you would cast everything you are already casting and that can be casted quicker 1% faster. Mana and overhealing are not accounted for in any way.<br /><br />
          
          The real value of Haste (HPCT) will be between 0 and the shown value. It depends on if you have the mana left to spend, if the gained casts would overheal and how well you are at casting spells limited by Hasted cooldowns end-to-end. If you are going OOM before the end of the fight you might instead want to drop some Haste or cast less bad heals. If you had mana left-over, Haste could help you convert that into healing. If your Haste usage is optimal Haste will then be worth the shown max value.<br /><br />
          
          If there are intense moments of damage taken where people are dying due to lack of healing and you're GCD capped, Haste might also help increase your throughput during this period saving lifes and helping you kill the boss.<br /><br />
          
          <b>The easiest advice here is to get Haste to a point you're comfortable at. This is usually around 5-9%.</b>
        `,
      },
      // STAT.HASTE_HPM, this is always 0 for Holy Paladins
      STAT.MASTERY,
      STAT.VERSATILITY,
      STAT.VERSATILITY_DR,
      STAT.LEECH,
    ];
  }
}

export default StatValues;
