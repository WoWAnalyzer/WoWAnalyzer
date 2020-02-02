import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'interface/ItemDamageDone';
import { RAPTOR_MONGOOSE_VARIANTS, TIP_DAMAGE_INCREASE, TIP_MAX_STACKS } from 'parser/hunter/survival/constants';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

/**
 * Kill Command increases the damage of your next Raptor Strike by 20%, stacking up to 3 times.
 *
 * Example log: https://www.warcraftlogs.com/reports/BjmyHd9zt8RYJrWA/#fight=3&source=1
 */

const MS_BUFFER = 100;

class TipOfTheSpear extends Analyzer {

  spenderCasts = 0;
  stacks = 0;
  usedStacks = 0;
  wastedStacks = 0;
  damage = 0;
  lastApplicationTimestamp = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TIP_OF_THE_SPEAR_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.KILL_COMMAND_CAST_SV.id && !RAPTOR_MONGOOSE_VARIANTS.includes(spellId)) {
      return;
    }

    if (spellId === SPELLS.KILL_COMMAND_CAST_SV.id) {
      if (this.stacks === TIP_MAX_STACKS && event.timestamp > this.lastApplicationTimestamp + MS_BUFFER) {
        this.wastedStacks += 1;
      }
      return;
    }

    if (RAPTOR_MONGOOSE_VARIANTS.includes(spellId)) {
      this.spenderCasts += 1;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!RAPTOR_MONGOOSE_VARIANTS.includes(spellId)) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, TIP_DAMAGE_INCREASE * this.stacks);
    this.usedStacks += this.stacks;
  }

  on_byPlayer_changebuffstack(event) {
    if (event.ability.guid !== SPELLS.TIP_OF_THE_SPEAR_CAST.id) {
      return;
    }
    this.stacks = event.newStacks;
    if (event.newStacks !== 0) {
      this.lastApplicationTimestamp = event.timestamp;
    }
  }
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)}
        size="flexible"
        tooltip={(
          <>
            You consumed {this.usedStacks}/{this.usedStacks + this.wastedStacks} possible stacks.
          </>
        )}
        category={'TALENTS'}
      >
        <BoringSpellValueText spell={SPELLS.TIP_OF_THE_SPEAR_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} /> <br />
            {(this.usedStacks / this.spenderCasts).toFixed(2)} <small>avg stacks</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TipOfTheSpear;
