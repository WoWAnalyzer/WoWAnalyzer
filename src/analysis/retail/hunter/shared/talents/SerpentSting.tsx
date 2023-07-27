import { defineMessage } from '@lingui/macro';
import {
  SERPENT_STING_MM_BASE_DURATION,
  SERPENT_STING_MM_PANDEMIC,
} from 'analysis/retail/hunter/marksmanship/constants';
import { formatPercentage } from 'common/format';
import { TALENTS_HUNTER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  RefreshDebuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { ONE_SECOND_IN_MS } from '../constants';

/**
 * Fire a shot that poisons your target, causing them to take (16.5% of Attack power) Nature damage instantly and an additional (99% of Attack power) Nature damage over 18 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/GWwtNLVQD8adn6q9#fight=5&type=damage-done&source=18&ability=271788
 *
 */

class SerpentSting extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  serpentStingTargets: Array<{ timestamp: number; serpentStingDuration: number }> = [];
  damage: number = 0;
  timesRefreshed: number = 0;
  nonPandemicRefresh: number = 0;
  casts: number = 0;
  castTimestamp: number = 0;

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_HUNTER.SERPENT_STING_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.SERPENT_STING_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.SERPENT_STING_TALENT),
      this.onDamage,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.SERPENT_STING_TALENT),
      this.onApplyDebuff,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.SERPENT_STING_TALENT),
      this.onRemoveDebuff,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.SERPENT_STING_TALENT),
      this.onRefreshDebuff,
    );
  }

  get uptimePercentage() {
    return (
      this.enemies.getBuffUptime(TALENTS_HUNTER.SERPENT_STING_TALENT.id) / this.owner.fightDuration
    );
  }

  get nonPandemicThreshold() {
    return {
      actual: this.nonPandemicRefresh,
      isGreaterThan: {
        minor: 1,
        average: 3,
        major: 5,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get uptimeThreshold() {
    return {
      actual: this.uptimePercentage,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onCast(event: CastEvent) {
    this.casts += 1;
    this.castTimestamp = event.timestamp;
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onApplyDebuff(event: ApplyDebuffEvent) {
    let targetInstance = event.targetInstance;
    if (targetInstance === undefined) {
      targetInstance = 1;
    }
    const serpentStingTarget = Number(encodeTargetString(event.targetID, targetInstance));
    this.serpentStingTargets[serpentStingTarget] = {
      timestamp: event.timestamp,
      serpentStingDuration: SERPENT_STING_MM_BASE_DURATION,
    };
  }

  onRemoveDebuff(event: RemoveDebuffEvent) {
    let targetInstance = event.targetInstance;
    if (targetInstance === undefined) {
      targetInstance = 1;
    }
    const serpentStingTarget = Number(encodeTargetString(event.targetID, targetInstance));
    this.serpentStingTargets.splice(serpentStingTarget, 1);
  }

  onRefreshDebuff(event: RefreshDebuffEvent) {
    if (event.timestamp > this.castTimestamp + ONE_SECOND_IN_MS) {
      return;
    }
    let targetInstance = event.targetInstance;
    if (targetInstance === undefined) {
      targetInstance = 1;
    }
    const serpentStingTarget = Number(encodeTargetString(event.targetID, targetInstance));
    this.timesRefreshed += 1;

    const timeRemaining =
      this.serpentStingTargets[serpentStingTarget].serpentStingDuration -
      (event.timestamp - this.serpentStingTargets[serpentStingTarget].timestamp);
    if (timeRemaining > SERPENT_STING_MM_BASE_DURATION * SERPENT_STING_MM_PANDEMIC) {
      this.nonPandemicRefresh += 1;
    } else {
      const pandemicSerpentStingDuration =
        Math.min(SERPENT_STING_MM_BASE_DURATION * SERPENT_STING_MM_PANDEMIC, timeRemaining) +
        SERPENT_STING_MM_BASE_DURATION;
      this.serpentStingTargets[serpentStingTarget].timestamp = event.timestamp;
      this.serpentStingTargets[serpentStingTarget].serpentStingDuration =
        pandemicSerpentStingDuration;
    }
  }

  suggestions(when: When) {
    when(this.nonPandemicThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          It is not recommended to refresh <SpellLink spell={TALENTS_HUNTER.SERPENT_STING_TALENT} />{' '}
          earlier than when there is less than {formatPercentage(SERPENT_STING_MM_PANDEMIC, 0)}% of
          the duration remaining.
        </>,
      )
        .icon(TALENTS_HUNTER.SERPENT_STING_TALENT.icon)
        .actual(
          defineMessage({
            id: 'hunter.marksmanship.suggestions.serpentSting.refreshOutsidePandemic',
            message: `You refreshed Serpent Sting ${actual} times when it wasn't in the pandemic window`,
          }),
        )
        .recommended(`${recommended} non-pandemic refreshes is recommended`),
    );

    when(this.uptimeThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You should make sure to keep up <SpellLink spell={TALENTS_HUNTER.SERPENT_STING_TALENT} />{' '}
          by using it within the pandemic windows to maximize it's damage potential.
        </>,
      )
        .icon(TALENTS_HUNTER.SERPENT_STING_TALENT.icon)
        .actual(
          defineMessage({
            id: 'hunter.marksmanship.suggestions.serpentSting.uptime',
            message: `You had an uptime of ${formatPercentage(actual, 0)}%`,
          }),
        )
        .recommended(`An uptime of >${formatPercentage(recommended, 0)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <ul>
              <li>You cast Serpent Sting a total of {this.casts} times.</li>
              <li>You refreshed the debuff {this.timesRefreshed} times.</li>
              <li>
                You had {this.nonPandemicRefresh} refreshes outside of the pandemic window. This
                means refreshes with more than {formatPercentage(SERPENT_STING_MM_PANDEMIC, 0)}% of
                the current debuff remaining.
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_HUNTER.SERPENT_STING_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
            <br />
            {formatPercentage(this.uptimePercentage)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SerpentSting;
