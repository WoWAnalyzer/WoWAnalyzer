import { Trans } from '@lingui/macro';
import { StandardChecks } from 'analysis/retail/mage/shared';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import HotStreakPreCasts from './HotStreakPreCasts';

class HotStreak extends Analyzer {
  static dependencies = {
    hotStreakPreCasts: HotStreakPreCasts,
    standardChecks: StandardChecks,
  };
  protected hotStreakPreCasts!: HotStreakPreCasts;
  protected standardChecks!: StandardChecks;

  hasPyroclasm: boolean = this.selectedCombatant.hasTalent(SPELLS.PYROCLASM_TALENT.id);

  expiredProcs = () =>
    this.standardChecks.countExpiredProcs(SPELLS.HOT_STREAK, [
      SPELLS.PYROBLAST,
      SPELLS.FLAMESTRIKE,
    ]);

  get totalHotStreakProcs() {
    return this.standardChecks.countEvents(EventType.ApplyBuff, SPELLS.HOT_STREAK);
  }

  get hotStreakUtil() {
    return 1 - this.expiredProcs() / this.totalHotStreakProcs || 0;
  }

  get hotStreakUtilizationThresholds() {
    return {
      actual: this.hotStreakUtil,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.hotStreakUtilizationThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You allowed {formatPercentage(this.expiredProcs() / this.totalHotStreakProcs)}% of your{' '}
          <SpellLink id={SPELLS.HOT_STREAK.id} /> procs to expire. Try to use your procs as soon as
          possible to avoid this.
        </>,
      )
        .icon(SPELLS.HOT_STREAK.icon)
        .actual(
          <Trans id="mage.fire.suggestions.hotStreak.expired">
            {formatPercentage(this.hotStreakUtil)}% expired
          </Trans>,
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(15)}
        size="flexible"
        tooltip={
          <>
            Hot Streak is a big part of your rotation and therefore it is important that you use all
            the procs that you get and avoid letting them expire. <br />
            <br />
            Additionally, to maximize your chance of getting Heating Up/Hot Streak procs, you should
            hard cast Fireball
            {this.hasPyroclasm ? ' (or Pyroblast if you have a Pyroclasm proc)' : ''} just before
            using your Hot Streak proc unless you are guaranteed to crit via Firestarter, Searing
            Touch, or Combustion. This way if one of the two spells crit you will get a new Heating
            Up proc, and if both spells crit then you will get a new Hot Streak proc.
            <br />
            <ul>
              <li>Total procs - {this.totalHotStreakProcs}</li>
              <li>Used procs - {this.totalHotStreakProcs - this.expiredProcs()}</li>
              <li>Expired procs - {this.expiredProcs()}</li>
              <li>
                Procs used without a Fireball - {this.hotStreakPreCasts.missingHotStreakPreCast()}
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.HOT_STREAK.id}>
          <>
            {formatPercentage(this.hotStreakUtil, 0)}% <small>Proc Utilization</small>
            <br />
            {formatPercentage(this.hotStreakPreCasts.castBeforeHotStreakUtil, 0)}%{' '}
            <small>Procs used alongside Fireball</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HotStreak;
