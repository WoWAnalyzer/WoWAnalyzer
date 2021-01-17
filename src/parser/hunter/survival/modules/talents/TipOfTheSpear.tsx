import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'interface/ItemDamageDone';
import { RAPTOR_MONGOOSE_VARIANTS, TIP_DAMAGE_INCREASE, TIP_MAX_STACKS } from 'parser/hunter/survival/constants';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { CastEvent, ChangeBuffStackEvent, DamageEvent } from 'parser/core/Events';
import { MS_BUFFER } from 'parser/hunter/shared/constants';

/**
 * Kill Command increases the damage of your next Raptor Strike by 20%, stacking up to 3 times.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/ZRALzNbMpqka1fTB#fight=17&type=auras&source=329&translate=true&ability=260286
 */

class TipOfTheSpear extends Analyzer {
  spenderCasts = 0;
  stacks = 0;
  usedStacks = 0;
  wastedStacks = 0;
  damage = 0;
  lastApplicationTimestamp = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.TIP_OF_THE_SPEAR_TALENT.id);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.KILL_COMMAND_CAST_SV), this.onKillCommandCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(RAPTOR_MONGOOSE_VARIANTS), this.onSpenderCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(RAPTOR_MONGOOSE_VARIANTS), this.onDamage);
    this.addEventListener(Events.changebuffstack.by(SELECTED_PLAYER).spell(SPELLS.TIP_OF_THE_SPEAR_CAST), this.onChangeBuffStack);
  }

  onSpenderCast() {
    this.spenderCasts += 1;
  }

  onKillCommandCast(event: CastEvent) {
    if (this.stacks === TIP_MAX_STACKS && event.timestamp > this.lastApplicationTimestamp + MS_BUFFER) {
      this.wastedStacks += 1;
    }
  }

  onDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, TIP_DAMAGE_INCREASE * this.stacks);
    this.usedStacks += this.stacks;
  }

  onChangeBuffStack(event: ChangeBuffStackEvent) {
    if (event.newStacks !== 0) {
      this.lastApplicationTimestamp = event.timestamp;
    }
    this.stacks = event.newStacks;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.TIP_OF_THE_SPEAR_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} /> <br />
            <small>Used</small> {this.usedStacks}/{this.usedStacks + this.wastedStacks} <small>possible stacks</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TipOfTheSpear;
