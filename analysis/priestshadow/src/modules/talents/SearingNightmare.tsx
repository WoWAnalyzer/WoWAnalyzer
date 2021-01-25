import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { formatNumber } from 'common/format';
import AbilityTracker from '@wowanalyzer/priest-shadow/src/modules/core/AbilityTracker';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { SpellLink } from 'interface';
import { t } from '@lingui/macro';

class SearingNightmare extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  damage = 0;
  totalTargetsHit = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SEARING_NIGHTMARE_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SEARING_NIGHTMARE_TALENT), this.onDamage);
  }

  get averageTargetsHit() {
    return this.totalTargetsHit / this.abilityTracker.getAbility(SPELLS.SEARING_NIGHTMARE_TALENT.id).casts || 0;
  }

  onDamage(event: DamageEvent) {
    this.totalTargetsHit += 1;
    this.damage += event.amount + (event.absorbed || 0);
  }

  get suggestionThresholds() {
    return {
      actual: this.averageTargetsHit,
      isLessThan: {
        minor: 4,
        average: 3.5,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You hit an average of {formatNumber(actual)} targets with <SpellLink id={SPELLS.SEARING_NIGHTMARE_TALENT.id} />. Using <SpellLink id={SPELLS.SEARING_NIGHTMARE_TALENT.id} /> below {formatNumber(recommended)} targets is not worth it and you will get more damage value from your insanity with <SpellLink id={SPELLS.DEVOURING_PLAGUE.id} />. If you are not getting enough hits or casts from this talent, you will likely benefit more from a different one.
        </>
      )
        .icon(SPELLS.SEARING_NIGHTMARE_TALENT.icon)
        .actual(
          t({
            id: 'priest.shadow.suggestions.searingNightmare.efficiency',
            message: `Hit an average of ${formatNumber(actual)} targets with Searing Nightmare.`,
          }),
        )
        .recommended(`>=${recommended} is recommended.`),
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`Average targets hit: ${formatNumber(this.averageTargetsHit)}`}
      >
        <BoringSpellValueText spell={SPELLS.SEARING_NIGHTMARE_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SearingNightmare;
