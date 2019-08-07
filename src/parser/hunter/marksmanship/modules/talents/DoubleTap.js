import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Statistic from 'interface/statistics/Statistic';
import { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

/**
 * Your next Aimed Shot will fire a second time instantly at 100% power without consuming Focus, or your next Rapid Fire will shoot 100% additional shots during its channel.
 *
 * Example log: https://www.warcraftlogs.com/reports/aqRc7Fnvf2dmPMD3#fight=75&type=damage-done
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
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={'TALENTS'}
        tooltip={(
          <>
            You used Double Tap a total of {this.activations} times, and utilised {this.totalUsage} of them.
            <ul>
              {this.aimedUsage > 0 && <li>Out of the total activations, you used {this.aimedUsage} of them on Aimed Shots.</li>}
              {this.RFUsage > 0 && <li>Out of the total activations, you used {this.RFUsage} of them on Rapid Fires.</li>}
            </ul>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.DOUBLE_TAP_TALENT}>
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
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DoubleTap;
