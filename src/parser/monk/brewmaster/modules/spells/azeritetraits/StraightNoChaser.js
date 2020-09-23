import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import StatTracker from 'parser/shared/modules/StatTracker';
import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import SpellLink from 'common/SpellLink';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { formatNumber, formatPercentage } from 'common/format';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';

import SpellUsable from '../../core/SpellUsable';

const SNC_PROC_CHANCE = 0.08;

export default class StraightNoChaser extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    stats: StatTracker,
    spellUsable: SpellUsable,
  };

  armor = 0;

  get isbCasts() {
    return this.abilityTracker.getAbility(SPELLS.IRONSKIN_BREW.id).casts;
  }

  get resets() {
    return this.spellUsable._SNCResets;
  }

  get uptimePct() {
    return this.selectedCombatant.getBuffUptime(SPELLS.STRAIGHT_NO_CHASER_BUFF.id) / this.owner.fightDuration;
  }

  get avgArmor() {
    return this.armor * this.uptimePct;
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.STRAIGHT_NO_CHASER.id);
    if (!this.active) {
      return;
    }

    this.armor = this.selectedCombatant.traitsBySpellId[SPELLS.STRAIGHT_NO_CHASER.id].reduce((sum, rank) => {
      const [armor] = calculateAzeriteEffects(SPELLS.STRAIGHT_NO_CHASER.id, rank);
      return sum + armor;
    }, 0);

    this.stats.add(SPELLS.STRAIGHT_NO_CHASER.id, {
      armor: this.armor,
    });
  }

  statistic() {
    return (
      <TraitStatisticBox
        trait={SPELLS.STRAIGHT_NO_CHASER.id}
        value={(
          <>
            ≥{this.resets} Charges Gained<br />
            {formatNumber(this.avgArmor)} Armor Gained
          </>
        )}
        tooltip={(
          <>
            There are no logged events for SNC's generated brew charges, so this is an <em>estimate</em> based on casts that occurred while your brews are on cooldown. <b>If you have low cast efficiency, this will be <em>underestimated!</em></b><br /><br />
            Straight, No Chaser gave <b>{this.armor}</b> armor, and was up for {formatPercentage(this.uptimePct)}% of the fight.
          </>
        )}
      >
        <div style={{ padding: '8px' }}>
          {plotOneVariableBinomChart(this.resets, this.isbCasts, SNC_PROC_CHANCE, 'Charges Gained', 'Estimated Charges Gained: ')}
          <p>Likelihood of getting <em>exactly</em> as many extra charges as estimated on a fight given your number of <SpellLink id={SPELLS.IRONSKIN_BREW.id} /> casts.</p>
        </div>
      </TraitStatisticBox>
    );
  }
}
