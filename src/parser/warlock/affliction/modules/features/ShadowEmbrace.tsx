import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import Events, { ChangeDebuffStackEvent, DamageEvent } from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatThousands, formatNumber } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import UptimeBar from 'interface/statistics/components/UptimeBar';

import { t } from '@lingui/macro';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

const BONUS_PER_STACK = 0.03;
const BUFFER = 50; // for some reason, changedebuffstack triggers twice on the same timestamp for each event, ignore an event if it happened < BUFFER ms after another
const debug = false;

type ShadowEmbraceStacks = 0 | 1 | 2 | 3;
type ShadowEmbraceUptime = {
  start: number | null;
  count: number;
  uptime: number;
};

class ShadowEmbrace extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  damage = 0;
  private _lastEventTimestamp: number | null = null;
  debuffs: Record<ShadowEmbraceStacks, ShadowEmbraceUptime> = {
    0: {
      // ignored, see comment in stackedUptime getter
      start: null,
      count: 1,
      uptime: 0,
    },
    1: {
      start: null,
      count: 0,
      uptime: 0,
    },
    2: {
      start: null,
      count: 0,
      uptime: 0,
    },
    3: {
      start: null,
      count: 0,
      uptime: 0,
    },
  };

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(
      Events.changedebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_EMBRACE_DEBUFF),
      this.onChangeDebuffStack,
    );
  }

  onDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    const shadowEmbrace = enemy.getBuff(SPELLS.SHADOW_EMBRACE_DEBUFF.id);
    if (!shadowEmbrace) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, shadowEmbrace.stacks * BONUS_PER_STACK);
  }

  onChangeDebuffStack(event: ChangeDebuffStackEvent) {
    if (event.targetIsFriendly) {
      return;
    }
    if (this._lastEventTimestamp !== null && event.timestamp <= this._lastEventTimestamp + BUFFER) {
      debug &&
        console.log(
          `!! (${this.owner.formatTimestamp(event.timestamp, 3)}) ignoring duplicate event`,
        );
      return;
    }
    this._lastEventTimestamp = event.timestamp;
    debug &&
      console.log(
        `-- (${this.owner.formatTimestamp(
          event.timestamp,
          3,
        )}) changedebuffstack on ${encodeTargetString(event.targetID, event.targetInstance)}`,
      );

    const oldStacks = this.debuffs[event.oldStacks as ShadowEmbraceStacks];
    const newStacks = this.debuffs[event.newStacks as ShadowEmbraceStacks];
    oldStacks.count = Math.max(oldStacks.count - 1, 0);
    debug && console.log(`OLD (${event.oldStacks}), count reduced to ${oldStacks.count}`);
    if (oldStacks.count === 0) {
      oldStacks.uptime += event.timestamp - (oldStacks.start || 0);
      debug &&
        console.log(`OLD (${event.oldStacks}) count 0, updated uptime to ${oldStacks.uptime}`);
    }

    if (newStacks.count === 0) {
      newStacks.start = event.timestamp;
      debug && console.log(`NEW (${event.newStacks}) count 0, started counting`);
    }
    newStacks.count += 1;
    debug && console.log(`NEW (${event.newStacks}), count increased to ${newStacks.count}`);
  }

  get totalUptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.SHADOW_EMBRACE_DEBUFF.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.totalUptimePercentage,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get stackedUptime() {
    const duration = this.owner.fightDuration;
    // it's easier to calculate no stack uptime as 1 - anyStackUptimePercentage, that's why we ignore this.debuffs[0]
    return {
      0: 1 - this.totalUptimePercentage,
      1: this.debuffs[1].uptime / duration,
      2: this.debuffs[2].uptime / duration,
      3: this.debuffs[3].uptime / duration,
    };
  }

  get dps() {
    return (this.damage / this.owner.fightDuration) * 1000;
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.SHADOW_EMBRACE_DEBUFF.id} /> uptime can be improved. Try to pay
          more attention to your Shadow Embrace on the boss, perhaps use some debuff tracker.
        </>,
      )
        .icon(SPELLS.SHADOW_EMBRACE_DEBUFF.icon)
        .actual(
          t({
            id: 'warlock.affliction.suggestions.shadowembrace.uptime',
            message: `${formatPercentage(actual)}% Shadow Embrace uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  subStatistic() {
    const history = this.enemies.getDebuffHistory(SPELLS.SHADOW_EMBRACE_DEBUFF.id);
    return (
      <div className="flex">
        <div className="flex-sub icon">
          <SpellIcon id={SPELLS.SHADOW_EMBRACE_DEBUFF.id} />
        </div>
        <div className="flex-sub value" style={{ width: 140 }}>
          {formatPercentage(this.totalUptimePercentage, 0)} % <small>uptime</small>
        </div>
        <div className="flex-main chart" style={{ padding: 15 }}>
          <UptimeBar
            uptimeHistory={history}
            start={this.owner.fight.start_time}
            end={this.owner.fight.end_time}
          />
        </div>
      </div>
    );
  }

  statistic() {
    const uptimes = this.stackedUptime;
    return (
      <Statistic
        category={STATISTIC_CATEGORY.GENERAL}
        size="flexible"
        tooltip={`${formatThousands(this.damage)} bonus damage`}
      >
        <BoringSpellValueText spell={SPELLS.SHADOW_EMBRACE}>
          {formatPercentage(this.totalUptimePercentage)} %{' '}
          <TooltipElement
            content={
              <>
                No stacks: {formatPercentage(uptimes[0])} %<br />1 stack:
                {formatPercentage(uptimes[1])} %<br />2 stacks: {formatPercentage(uptimes[2])} %
                <br />3 stacks: {formatPercentage(uptimes[3])} %
              </>
            }
          >
            <small>
              uptime <sup>*</sup>
            </small>
          </TooltipElement>
          <br />
          {formatNumber(this.dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} % of total
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ShadowEmbrace;
