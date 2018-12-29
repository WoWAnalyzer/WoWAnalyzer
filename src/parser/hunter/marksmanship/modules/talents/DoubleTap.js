import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import SpellIcon from 'common/SpellIcon';

/**
 * Your next Aimed Shot will fire a second time instantly at 100% power without consuming Focus, or your next Rapid Fire will shoot 100% additional shots during its channel.
 *
 * Example log: https://www.warcraftlogs.com/reports/kXAQGnqwR7tm1zMJ#fight=38&type=auras&source=75
 */

class DoubleTap extends Analyzer {

  activations = 0;
  aimedUsage = 0;
  RFUsage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DOUBLE_TAP_TALENT.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DOUBLE_TAP_TALENT.id) {
      return;
    }
    this.activations++;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if ((spellId !== SPELLS.AIMED_SHOT.id && spellId !== SPELLS.RAPID_FIRE.id) || !this.selectedCombatant.hasBuff(SPELLS.DOUBLE_TAP_TALENT.id)) {
      return;
    }
    if (spellId === SPELLS.AIMED_SHOT.id) {
      this.aimedUsage++;
    }
    if (spellId === SPELLS.RAPID_FIRE.id) {
      this.RFUsage++;
    }
  }

  get totalUsage() {
    return this.RFUsage + this.aimedUsage;
  }

  statistic() {
    let tooltipText = `You used Double Tap a total of ${this.activations} times, and utilised ${this.totalUsage} of them.<ul>`;
    tooltipText += this.aimedUsage > 0 ? `<li>Out of the total activations, you used ${this.aimedUsage} of them on Aimed Shots.</li>` : ``;
    tooltipText += this.RFUsage > 0 ? `<li>Out of the total activations, you used ${this.RFUsage} of them on Rapid Fires.</li>` : ``;
    tooltipText += `</ul>`;

    return (
      <TalentStatisticBox
        talent={SPELLS.DOUBLE_TAP_TALENT.id}
        value={(
          <>
            {this.aimedUsage}{'  '}
            <SpellIcon
              id={SPELLS.AIMED_SHOT.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
            {'  '}
            {this.RFUsage}{'  '}
            <SpellIcon
              id={SPELLS.RAPID_FIRE.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
          </>
        )}
        tooltip={tooltipText}
      />
    );
  }
}

export default DoubleTap;
