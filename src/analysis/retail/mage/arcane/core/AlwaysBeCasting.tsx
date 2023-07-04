import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { When } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  suggestions(when: When) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;
    const boss = this.owner.boss;

    if (!boss || !boss.fight.disableDowntimeSuggestion) {
      when(deadTimePercentage)
        .isGreaterThan(0.2)
        .addSuggestion((suggest, actual, recommended) =>
          suggest(
            <span>
              Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay
              between casting spells. If a fight requires movement, try saving{' '}
              <SpellLink spell={TALENTS.PRESENCE_OF_MIND_TALENT} /> to make your next 2{' '}
              <SpellLink spell={SPELLS.ARCANE_BLAST} /> casts instant.
            </span>,
          )
            .icon('spell_mage_altertime')
            .actual(
              <Trans id="mage.arcane.suggestions.alwaysBeCasting.downtime">
                {formatPercentage(actual)}% downtime
              </Trans>,
            )
            .recommended(`<${formatPercentage(recommended)}% is recommended`)
            .regular(recommended + 0.15)
            .major(recommended + 0.2),
        );
    }
  }

  position = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
