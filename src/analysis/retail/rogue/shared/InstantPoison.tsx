import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import * as React from 'react';

class InstantPoison extends Analyzer {
  numPoisonHits = 0;
  numMeleeHits = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.INSTANT_POISON),
      this.onInstantPoisonDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MELEE),
      this.onMeleeDamage,
    );
  }

  onInstantPoisonDamage(event: DamageEvent) {
    this.numPoisonHits += 1;
  }

  onMeleeDamage(event: DamageEvent) {
    this.numMeleeHits += 1;
  }

  get procPercentage(): number {
    return this.numPoisonHits / this.numMeleeHits;
  }

  get instantPoisonSuggestionThresholds(): NumberThreshold {
    return {
      actual: this.procPercentage,
      isLessThan: {
        minor: 0.2,
        average: 0.15,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic(): React.ReactNode {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.GENERAL}>
        <BoringValueText
          label={
            <>
              <SpellIcon spell={SPELLS.INSTANT_POISON} /> Instant Poison Proc Percentage
            </>
          }
        >
          {formatPercentage(this.procPercentage)} %
        </BoringValueText>
      </Statistic>
    );
  }
}

export default InstantPoison;
