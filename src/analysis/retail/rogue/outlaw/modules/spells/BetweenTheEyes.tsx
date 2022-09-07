import { t } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { UpdateSpellUsableEvent, UpdateSpellUsableType } from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import AlwaysBeCasting from '../features/AlwaysBeCasting';

class BetweenTheEyes extends Analyzer {
  timestampFromCD: number = 0;
  totalTimeOffCD: number = 0;
  isFirstCast: boolean = true;

  static dependencies = {
    spellUsable: SpellUsable,
    alwaysBeCasting: AlwaysBeCasting,
  };
  protected spellUsable!: SpellUsable;
  protected alwaysBeCasting!: AlwaysBeCasting;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(SPELLS.BETWEEN_THE_EYES),
      this.onBetweenTheEyesUsable,
    );
  }

  onBetweenTheEyesUsable(event: UpdateSpellUsableEvent) {
    switch (event.updateType) {
      case UpdateSpellUsableType.BeginCooldown: {
        if (!this.isFirstCast) {
          this.totalTimeOffCD += event.timestamp - this.timestampFromCD;
        } else {
          this.isFirstCast = false;
        }
        break;
      }

      case UpdateSpellUsableType.EndCooldown: {
        this.timestampFromCD = event.timestamp;
        break;
      }
    }
  }

  // Thresholds get retrieved at the end of analyzing
  get thresholds(): NumberThreshold {
    return {
      actual: this.percentTimeOnCD,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get secondsOffCD(): number {
    return this.totalTimeOffCD / 1000;
  }

  get percentTimeOffCD(): number {
    return this.secondsOffCD / (this.owner.fightDuration / 1000);
  }

  get percentTimeOnCD(): number {
    return 1 - this.percentTimeOffCD;
  }

  get inefficientCastSuggestion(): JSX.Element {
    return (
      <>
        You should try to cast <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> more often.
        <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> should almost always be used as a finisher
        when it is available
      </>
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={
          <>
            This is the time of how much of the fight <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} />{' '}
            was on cooldown. <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> generally has to be used
            as soon as it comes off cooldown, cast should therefore only be delayed for a minimum
            amount of time in order to maximise debuff uptime{' '}
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.BETWEEN_THE_EYES.id}>
          <>
            {formatPercentage(this.thresholds.actual)}% <small>time spent on cooldown</small>
            <br />
            {formatNumber(this.secondsOffCD)}s <small>total seconds spent off cooldown</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  suggestions(when: When) {
    when(this.thresholds)
      .isLessThan(this.thresholds.isLessThan!)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(this.inefficientCastSuggestion)
          .icon(SPELLS.BETWEEN_THE_EYES.icon)
          .actual(
            t({
              id: 'rogue.outlaw.suggestions.betweentheEyes.timeoffCD',
              message: `${formatPercentage(actual)}% time spent on cooldown`,
            }),
          )
          .recommended(`>${formatPercentage(recommended)}% is recommended`),
      );
  }
}

export default BetweenTheEyes;
