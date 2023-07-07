import { t } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';
import Events from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import EarlyDotRefreshesAnalyzer from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshes';
import badRefreshSuggestion from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshesSuggestionByCount';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import UptimeStackBar, { StackUptime } from 'parser/ui/UptimeStackBar';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { TrackedBuffEvent } from 'parser/core/Entity';
import { GUIDE_EXPLANATION_PERCENT_WIDTH } from '../../elemental/constants';

class FlameShock extends EarlyDotRefreshesAnalyzer {
  static dependencies = {
    ...EarlyDotRefreshesAnalyzer.dependencies,
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  static dots = [
    {
      name: 'Flame Shock',
      debuffId: SPELLS.FLAME_SHOCK.id,
      castId: SPELLS.FLAME_SHOCK.id,
      duration: 18000,
      movementFiller: true,
    },
  ];

  badLavaBursts = 0;

  startTime = 0;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.FLAME_SHOCK.id) / this.owner.fightDuration;
  }

  get refreshThreshold() {
    const casts: any = this.casts;
    return {
      spell: SPELLS.FLAME_SHOCK,
      count: casts[SPELLS.FLAME_SHOCK.id].badCasts,
      actual: this.badCastsPercent(SPELLS.FLAME_SHOCK.id),
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get uptimeThreshold() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.99,
        average: 0.95,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.LAVA_BURST_TALENT),
      this.onLavaBurst,
    );
  }

  onLavaBurst(event: DamageEvent) {
    const target = this.enemies.getEntity(event);
    if (target && !target.hasBuff(SPELLS.FLAME_SHOCK.id)) {
      this.badLavaBursts += 1;
    }
  }

  suggestions(when: When) {
    when(this.uptimeThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          Your <SpellLink spell={SPELLS.FLAME_SHOCK} /> uptime can be improved.
        </span>,
      )
        .icon(SPELLS.FLAME_SHOCK.icon)
        .actual(
          t({
            id: 'shaman.elemental.suggestions.flameShock.uptime',
            message: `${formatPercentage(actual)}% uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );

    when(this.badLavaBursts)
      .isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            Make sure to apply <SpellLink spell={SPELLS.FLAME_SHOCK} /> to your target, so your{' '}
            <SpellLink spell={TALENTS_SHAMAN.LAVA_BURST_TALENT} /> is guaranteed to critically
            strike.
          </span>,
        )
          .icon(TALENTS_SHAMAN.LAVA_BURST_TALENT.icon)
          .actual(
            t({
              id: 'shaman.elemental.suggestions.flameShock.efficiency',
              message: `${formatNumber(
                this.badLavaBursts,
              )} Lava Burst casts without Flame Shock DOT`,
            }),
          )
          .recommended(`0 is recommended`)
          .major(recommended + 1),
      );

    badRefreshSuggestion(when, this.refreshThreshold);
  }

  /**
   * Gets the debuff history with number of affected targets (stacks).
   * `getDebuffHistory` doesn't handle the target count.
   */
  getDebuffHistory(): { maxStacks: number; history: StackUptime[] } {
    type TempBuffInfo = {
      timestamp: number;
      type: 'apply' | 'remove';
      buff: TrackedBuffEvent;
    };
    const events: TempBuffInfo[] = [];
    const enemies = this.enemies.getEntities();
    Object.values(enemies).forEach((enemy) => {
      enemy.getBuffHistory(SPELLS.FLAME_SHOCK.id, this.owner.playerId).forEach((buff) => {
        events.push({
          timestamp: buff.start,
          type: 'apply',
          buff,
        });
        events.push({
          // If the debuff was not removed it must have lasted until the end of the fight.
          timestamp: buff.end !== null ? buff.end : this.owner.fight.end_time,
          type: 'remove',
          buff,
        });
      });
    });

    const history: StackUptime[] = [];
    let active = 0;
    let maxStacks = 0;
    let prevTimestamp: number | null = null;
    events
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach((event) => {
        const prevActive = active;
        if (event.type === 'apply') {
          active += 1;
          if (active > maxStacks) {
            maxStacks = active;
          }
        }
        if (event.type === 'remove') {
          active -= 1;
        }
        if (prevTimestamp === null) {
          prevTimestamp = event.timestamp;
          return;
        }

        if (prevActive > 0) {
          console.log('Adding entry', prevTimestamp, event.timestamp, prevActive);
          history.push({ start: prevTimestamp, end: event.timestamp, stacks: prevActive });
        }
        prevTimestamp = event.timestamp;
      });
    return { maxStacks, history };
  }

  guideSubsection() {
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink id={SPELLS.FLAME_SHOCK} />
          </b>{' '}
          is one of the best sources of damage for it's cast time. Additionally, it makes{' '}
          <SpellLink id={TALENTS_SHAMAN.LAVA_BURST_TALENT} /> into a critical hit. This should
          always be up on your target at low target counts.
        </p>
        <p>
          Every <SpellLink id={SPELLS.FLAME_SHOCK} /> damage tick has a chance to{' '}
          <SpellLink id={TALENTS_SHAMAN.LAVA_SURGE_TALENT} />, which make{' '}
          <SpellLink id={TALENTS_SHAMAN.LAVA_BURST_TALENT} /> instant-cast.
        </p>
      </>
    );

    const { maxStacks, history } = this.getDebuffHistory();

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink id={SPELLS.FLAME_SHOCK} /> uptime
          </strong>
          <div className="flex-main chart" style={{ height: '40px' }}>
            {formatPercentage(this.uptime)}% <small>uptime</small>
            <UptimeStackBar
              start={this.owner.fight.start_time}
              end={this.owner.fight.end_time}
              maxStacks={maxStacks}
              barColor="#ac1f39"
              stackUptimeHistory={history}
              timeTooltip
            />
          </div>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.badLavaBursts} <SpellLink id={TALENTS_SHAMAN.LAVA_BURST_TALENT} /> without{' '}
            <SpellLink id={SPELLS.FLAME_SHOCK} />
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_EXPLANATION_PERCENT_WIDTH);
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE()} size="flexible" tooltip="Flame Shock Uptime">
        <BoringSpellValueText spellId={SPELLS.FLAME_SHOCK.id}>
          <>
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FlameShock;
