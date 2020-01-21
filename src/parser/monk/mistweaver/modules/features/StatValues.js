import { Trans } from '@lingui/macro';
import React from 'react';

import BaseHealerStatValues from 'parser/shared/modules/features/BaseHealerStatValues';
import STAT from 'parser/shared/modules/features/STAT';
import StatTracker from 'parser/shared/modules/StatTracker';
import CritEffectBonus from 'parser/shared/modules/helpers/CritEffectBonus';

import SPELL_INFO from './StatValuesSpellInfo';

/**
 * Mistweaver Monk Stat Values
**/

class StatValues extends BaseHealerStatValues {
  static dependencies = {
    statTracker: StatTracker,
    critEffectBonus: CritEffectBonus,
  };

  spellInfo = SPELL_INFO;
  qeLive = true;

  _mastery(event, healVal) {
    if (healVal.overheal) {
      // If a spell overheals, it could not have healed for more. Seeing as Mastery is a secondary heal, that is proc'ed by our single target heals, any overheal can be ignored.
      return 0;
    }

    // assuming gust heal vs. mastery % are linear and start at 0 ( gust_heal = K * mast_pct )
    // h2 / h1 = mast_pct(rat) / mast_pct(rat-1)
    // solving that for h2 - h1 brings...
    return healVal.effective * ( 1 - (this.statTracker.masteryPercentage(this.statTracker.currentMasteryRating - 1, true) / this.statTracker.masteryPercentage(this.statTracker.currentMasteryRating, true)));

   }

  _prepareResults() {
    return [
      STAT.INTELLECT,
      STAT.CRITICAL_STRIKE,
      {
        stat: STAT.HASTE_HPCT,
        tooltip: (
          <Trans>
            HPCT stands for "Healing per Cast Time". This is the max value that Haste would be worth if you would cast everything you are already casting (that scales with Haste) faster. Mana and overhealing are not accounted for in any way.<br /><br />

            The real value of Haste (HPCT) will be between 0 and the shown value. It depends on various things, such as if you have the mana left to spend, if the gained casts would overheal, and how well you are at casting spells end-to-end. If you are going OOM before the end of the fight you might instead want to drop some Haste or cast fewer bad heals. If you had mana left-over, Haste could help you convert that into healing. If your Haste usage is optimal Haste will then be worth the shown max value.<br /><br />

            Haste can also help you safe lives during intense damage phases. If you notice you're GCD capped when people are dying, Haste might help you land more heals. This may contribute more towards actually getting the kill.
          </Trans>
        ),
      },
      STAT.HASTE_HPM,
      STAT.MASTERY,
      STAT.VERSATILITY,
      STAT.VERSATILITY_DR,
      STAT.LEECH,
    ];
  }
}

export default StatValues;
