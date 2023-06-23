import { t, Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get downtimeSuggestionThresholds(): NumberThreshold {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.2,
        average: 0.3,
        major: 0.4,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    const boss = this.owner.boss;

    if (!boss || !boss.fight.disableDowntimeSuggestion) {
      when(this.downtimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
        suggest(
          <Trans id="deathknight.blood.alwaysBeCasting.suggestion.suggestion">
            While some downtime is inevitable in fights with movement, you should aim to reduce
            downtime to prevent capping Runes. You can reduce downtime by casting ranged/filler
            abilities like <SpellLink spell={TALENTS.BLOODDRINKER_TALENT} /> or{' '}
            <SpellLink spell={TALENTS.BLOOD_BOIL_TALENT} />
          </Trans>,
        )
          .icon('spell_mage_altertime')
          .actual(
            t({
              id: 'deathknight.blood.alwaysBeCasting.suggestion.actual',
              message: `${formatPercentage(actual)}% downtime`,
            }),
          )
          .recommended(
            t({
              id: 'shared.suggestion.recommended.lessThanPercent',
              message: `<${formatPercentage(recommended)}% is recommended`,
            }),
          ),
      );
    }
  }
}

export default AlwaysBeCasting;
