import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import Mastery from '../core/Mastery';

class Cultivation extends Analyzer {
  static dependencies = {
    mastery: Mastery,
  };

  protected mastery!: Mastery;

  constructor(options: Options) {
    super(options);
    const hasCultivation = this.selectedCombatant.hasTalent(SPELLS.CULTIVATION_TALENT.id);
    this.active = hasCultivation;
  }

  get directHealing() {
    return this.mastery.getDirectHealing(SPELLS.CULTIVATION.id);
  }

  get masteryHealing() {
    return this.mastery.getMasteryHealing(SPELLS.CULTIVATION.id);
  }

  get totalHealing() {
    return this.directHealing + this.masteryHealing;
  }

  get totalPercent() {
    return this.owner.getPercentageOfTotalHealingDone(this.totalHealing);
  }

  get suggestionThresholds() {
    return {
      actual: this.totalPercent,
      isLessThan: {
        minor: 0.06,
        average: 0.045,
        major: 0.03,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your healing from <SpellLink id={SPELLS.CULTIVATION.id} /> could be improved. You may have
          too many healers or doing easy content, thus having low cultivation proc rate. You may
          considering selecting another talent.
        </>,
      )
        .icon(SPELLS.CULTIVATION.icon)
        .actual(
          t({
            id: 'druid.restoration.suggestions.cultivation.notOptimal',
            message: `${formatPercentage(this.totalPercent)}% healing`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(11)}
        size="flexible"
        tooltip={
          <>
            This is the sum of the direct healing from Cultivation and the healing enabled by
            Cultivation's extra mastery stack.
            <ul>
              <li>
                Direct: <strong>{this.owner.formatItemHealingDone(this.directHealing)}</strong>
              </li>
              <li>
                Mastery: <strong>{this.owner.formatItemHealingDone(this.masteryHealing)}</strong>
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.CULTIVATION_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Cultivation;
