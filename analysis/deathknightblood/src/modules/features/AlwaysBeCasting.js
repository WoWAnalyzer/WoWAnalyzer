import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import React from 'react';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.2,
        average: 0.3,
        major: 0.4,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const boss = this.owner.boss;

    if (!boss || !boss.fight.disableDowntimeSuggestion) {
      when(this.downtimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
        suggest(
          <>
            While some downtime is inevitable in fights with movement, you should aim to reduce
            downtime to prevent capping Runes. You can reduce downtime by casting ranged/filler
            abilities like <SpellLink id={SPELLS.BLOODDRINKER_TALENT.id} /> or{' '}
            <SpellLink id={SPELLS.BLOOD_BOIL.id} />
          </>,
        )
          .icon('spell_mage_altertime')
          .actual(
            t({
              id: 'deathknight.blood.suggestions.alwaysBeCasting.downtime',
              message: `${formatPercentage(actual)}% downtime`,
            }),
          )
          .recommended(`<${formatPercentage(recommended)}% is recommended`),
      );
    }
  }
}

export default AlwaysBeCasting;
