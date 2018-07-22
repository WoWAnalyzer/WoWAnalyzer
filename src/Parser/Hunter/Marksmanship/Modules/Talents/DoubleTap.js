import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import StatisticBox from 'Interface/Others/StatisticBox';
import SpellIcon from 'common/SpellIcon';

/**
 * Your next Aimed Shot will fire a second time instantly at 100% power without consuming Focus, or your next Rapid Fire will shoot 100% additional shots during its channel.
 */
class DoubleTap extends Analyzer {

  activations = 0;
  aimedUsage = 0;
  RFUsage = 0;
  doubleTapActive = false;

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
    this.doubleTapActive = true;
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DOUBLE_TAP_TALENT.id) {
      return;
    }
    this.doubleTapActive = false;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if ((spellId !== SPELLS.AIMED_SHOT.id && spellId !== SPELLS.RAPID_FIRE.id) && !this.doubleTapActive && !this.selectedCombatant.hasBuff(SPELLS.DOUBLE_TAP_TALENT.id)) {
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
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DOUBLE_TAP_TALENT.id} />}
        value={(
          <React.Fragment>
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
          </React.Fragment>
        )}
        label="Double Tap"
        tooltip={tooltipText}
      />
    );
  }
}

export default DoubleTap;
