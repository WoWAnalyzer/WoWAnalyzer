import React from 'react';
import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink, SpellIcon } from 'interface';
import { formatPercentage } from 'common/format';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { SuggestionFactory, ThresholdStyle, When } from 'parser/core/ParseResults';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import BoringValueText from 'parser/ui/BoringValueText';

const BLINDSIDE_EXECUTE = 0.3;
const MS_BUFFER = 100;

/**
 * Exploits the vulnerability of foes with less than 30% health.
 *
 * Mutilate has a 25% chance to make your next Blindside free and usable on any target, regardless of their health.
 */
class Blindside extends Analyzer {
  static dependencies = {
    enemyInstances: EnemyInstances,
  };
  casts = 0;
  badMutilates = 0;

  protected enemyInstances!: EnemyInstances;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BLINDSIDE_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.BLINDSIDE_TALENT, SPELLS.MUTILATE]), this.onCast);
  }

  get efficiency() {
    return (this.casts / this.casts + this.badMutilates) || 1;
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.BLINDSIDE_TALENT.id) {
      this.casts += 1;
    }
    if (spellId !== SPELLS.MUTILATE.id) {
      return;
    }

    //Sometimes buff event is before the cast.
    if (this.selectedCombatant.hasBuff(SPELLS.BLINDSIDE_BUFF.id, event.timestamp - MS_BUFFER)) {
      this.registerBadMutilate(event, "you had a Blindside Proc");
    }
    const target = this.enemyInstances.getEntity(event);
    if (target && target.hpPercent < BLINDSIDE_EXECUTE) {
      this.registerBadMutilate(event, `health of your target was < ${BLINDSIDE_EXECUTE}% `);
    }
  }

  registerBadMutilate(event: CastEvent, reason: string) {
    this.badMutilates += 1;
    event.meta = event.meta || {};
    event.meta.isInefficientCast = true;
    event.meta.inefficientCastReason = `You could cast Blindside, because ${reason}`;
  }

  get suggestionThresholds() {
    return {
      actual: this.efficiency,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest: SuggestionFactory, actual: number | boolean, recommended: number | boolean) => suggest(<>Use <SpellLink id={SPELLS.BLINDSIDE_TALENT.id} /> instead of <SpellLink id={SPELLS.MUTILATE.id} /> when the target is bellow 30% HP or when you have the <SpellLink id={SPELLS.BLINDSIDE_BUFF.id} /> proc. </>)
        .icon(SPELLS.BLINDSIDE_TALENT.icon)
        .actual(t({
      id: "rogue.assassination.suggestions.blindside.efficiency",
      message: `You used Mutilate ${this.badMutilates} times when Blindside was available`
    }))
        .recommended(`0 is recommended`));
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip="The efficiency is the number of Blindside casts divided by the number of Blindside casts plus the number of Mutilate casts while Blindside was available."
      >
        <BoringValueText label={<><SpellIcon id={SPELLS.BLINDSIDE_TALENT.id} /> Blindside efficiency</>}>
          {formatPercentage(this.efficiency)} %
        </BoringValueText>
      </Statistic>
    );
  }
}

export default Blindside;
