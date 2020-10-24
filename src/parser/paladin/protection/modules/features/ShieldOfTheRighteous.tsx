import React from 'react';
import { formatPercentage, formatThousands } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { findByBossId } from 'raids/index';
import Events, { AnyEvent, CastEvent, DamageEvent, FightEndEvent } from 'parser/core/Events';
import { shouldIgnore, magic } from 'parser/shared/modules/hit-tracking/utilities';
import Enemies from 'parser/shared/modules/Enemies';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

const SOTR_DURATION = 4500;

interface CastMetadata {
  castTime: number,
  buffStartTime: number,
  buffEndTime: number,
  melees: number,
  tankbusters: number,
  _event: CastEvent,
}

const isGoodCast = (cast: CastMetadata, endTime: number) => cast.melees >= 2 || cast.tankbusters >= 1 || cast.buffEndTime > endTime;

class ShieldOfTheRighteous extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  totalHits = 0;
  sotrHits = 0;
  totalDamageTaken = 0;
  sotrDamageTaken = 0;

  _tankbusters: number[] = [];

  _sotrCasts: CastMetadata[] = [];

  // this setup is used to track which melee attacks are mitigated by
  // which casts.
  _futureCasts: CastMetadata[] = [];
  _activeCast?: CastMetadata;

  _buffExpiration = 0;

  get _latestCast() {
    if (this._futureCasts.length > 0) {
      return this._futureCasts[this._futureCasts.length - 1];
    }

    return this._activeCast;
  }

  constructor(options: Options) {
    super(options);
    // M+ doesn't have a boss prop
    if (this.owner.boss) {
      const boss = findByBossId(this.owner.boss.id)!;
      this._tankbusters = (boss.fight.softMitigationChecks && boss.fight.softMitigationChecks.physical) || [];
      this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_OF_THE_RIGHTEOUS), this.onCast);
      this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
      this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.trackHits);
      this.addEventListener(Events.fightend, this.onFightend);
    }
  }


  onCast(event: CastEvent) {
    const buffEndTime = Math.min(
      // if the buff expired before the current event, its just
      // event.timestamp + SOTR_DURATION ...
      Math.max(this._buffExpiration, event.timestamp) + SOTR_DURATION,
      // ... otherwise limit it to no more than 3x SOTR_DURATION from
      // now due to buff duration caps
      event.timestamp + SOTR_DURATION * 3,
    );

    const cast = {
      castTime: event.timestamp,
      buffStartTime: Math.max(this._buffExpiration, event.timestamp),
      buffEndTime: buffEndTime,
      melees: 0,
      tankbusters: 0,
      _event: event,
    };

    this._buffExpiration = buffEndTime;

    this._updateActiveCast(event);
    if (cast.buffStartTime > cast.castTime) {
      this._futureCasts.push(cast);
    } else {
      this._activeCast = cast;
    }
    this._sotrCasts.push(cast);
  }

  onDamageTaken(event: DamageEvent) {
    if (event.ability.type !== MAGIC_SCHOOLS.ids.PHYSICAL) {
      return;
    }

    if (this.selectedCombatant.hasBuff(SPELLS.SHIELD_OF_THE_RIGHTEOUS_BUFF.id)) {
      if (this._tankbusters.includes(event.ability.guid)) {
        this._processTankbuster(event);
      } else {
        this._processPhysicalHit(event);
      }
    }
  }

  trackHits(event: DamageEvent) {
    if(shouldIgnore(this.enemies, event) || magic(event)) {
      return;
    }

    const amount = event.amount + (event.absorbed || 0) + (event.overkill || 0);

    this.totalHits += 1;
    this.totalDamageTaken += amount;
    if(this.selectedCombatant.hasBuff(SPELLS.SHIELD_OF_THE_RIGHTEOUS_BUFF.id)) {
      this.sotrHits += 1;
      this.sotrDamageTaken += amount;
    }
  }

  onFightend(event: FightEndEvent) {
    if (this._activeCast) {
      this._markupCast(this._activeCast);
    }
    this._futureCasts.forEach(this._markupCast.bind(this));
  }

  _processPhysicalHit(event: DamageEvent) {
    this._updateActiveCast(event);
    if (!this._activeCast) {
      return;
    }

    this._activeCast.melees += 1;
  }

  _processTankbuster(event: DamageEvent) {
    this._updateActiveCast(event);
    if (!this._activeCast) {
      return;
    }

    this._activeCast.tankbusters += 1;
  }

  // if the buff associated with the current active cast is no longer
  // active, move to the next.
  _updateActiveCast(event: AnyEvent) {
    while (this._activeCast && this._activeCast.buffEndTime < event.timestamp) {
      this._markupCast(this._activeCast);
      this._activeCast = this._futureCasts.shift();
    }
  }

  _markupCast(cast: CastMetadata) {
    if (isGoodCast(cast, this.owner.fight.end_time)) {
      return;
    }
    const meta = cast._event.meta || {};
    meta.isInefficientCast = true;
    meta.inefficientCastReason = 'This cast did not block many melee attacks, or block a tankbuster, or prevent you from capping SotR charges.';
    cast._event.meta = meta;
  }

  get goodCasts() {
    return this._sotrCasts.filter(cast => isGoodCast(cast, this.owner.fight.end_time));
  }

  get goodCastThreshold() {
    return {
      actual: this.goodCasts.length / this._sotrCasts.length,
      isLessThan: {
        minor: 0.9,
        average: 0.75,
        major: 0.6,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get hitsMitigatedThreshold() {
    return {
      actual: this.sotrHits / this.totalHits,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.goodCastThreshold)
      .addSuggestion((suggest, actual, recommended) => suggest(<>{formatPercentage(actual)}% of your <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> casts were <em>good</em> (they mitigated at least 2 auto-attacks or 1 tankbuster, or prevented capping charges). You should have Shield of the Righteous up to mitigate as much physical damage as possible.</>)
          .icon(SPELLS.SHIELD_OF_THE_RIGHTEOUS.icon)
          .actual(i18n._(t('paladin.protection.suggestions.shieldOfTheRighteous.goodCasts')`${formatPercentage(actual)}% good Shield of the Righteous casts`))
          .recommended(`${formatPercentage(recommended, 0)}% or more is recommended`));

    when(this.hitsMitigatedThreshold)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You should maintain <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> while actively tanking</>)
        .icon(SPELLS.SHIELD_OF_THE_RIGHTEOUS.icon)
        .actual(`${formatPercentage(actual)}% of hits mitigated by Shield of the Righteous`)
        .recommended(`at least ${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} />}
        value={`${formatPercentage(this.sotrHits / this.totalHits)}%`}
        label="Physical Hits Mitigated"
        tooltip={(
          <>
            Shield of the Righteous usage breakdown:
            <ul>
              <li>You were hit <strong>{this.sotrHits}</strong> times with your Shield of the Righteous buff (<strong>{formatThousands(this.sotrDamageTaken)}</strong> damage).</li>
              <li>You were hit <strong>{this.totalHits - this.sotrHits}</strong> times <strong><em>without</em></strong> your Shield of the Righteous buff (<strong>{formatThousands(this.totalDamageTaken - this.sotrDamageTaken)}</strong> damage).</li>
            </ul>
            <strong>{formatPercentage(this.sotrHits / this.totalHits)}%</strong> of physical attacks were mitigated with Shield of the Righteous.<br />
            <strong>{this.goodCasts.length}</strong> of your {this._sotrCasts.length} casts were <em>good</em> (blocked at least 2 melees or a tankbuster, or prevented capping charges).
          </>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(10);
}

export default ShieldOfTheRighteous;
