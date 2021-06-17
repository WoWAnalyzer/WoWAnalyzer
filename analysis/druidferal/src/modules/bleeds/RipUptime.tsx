import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink, TooltipElement } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';
import React from 'react';

import Snapshots2, { BLOODTALONS_SPEC, TIGERS_FURY_SPEC } from '../core/Snapshots2';
import Events, { ApplyDebuffEvent, DamageEvent, RefreshDebuffEvent } from 'parser/core/Events';
import {
  PRIMAL_WRATH_RIP_DURATION_BASE,
  PRIMAL_WRATH_RIP_DURATION_PER_CP,
  RIP_DURATION_BASE,
  RIP_DURATION_PER_CP,
  SABERTOOTH_EXTEND_PER_CP,
} from '../../constants';
import { getHardcast, getPrimalWrath, isFromHardcast } from '../../normalizers/CastLinkNormalizer';
import getComboPointsFromEvent from '../core/getComboPointsFromEvent';

class RipUptime extends Snapshots2 {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(SPELLS.RIP, SPELLS.RIP, [TIGERS_FURY_SPEC, BLOODTALONS_SPEC], options);

    // apply the Rip extension if player has Sabertooth
    if (this.selectedCombatant.hasTalent(SPELLS.SABERTOOTH_TALENT)) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEROCIOUS_BITE),
        this.onSabertoothFb,
      );
    }
  }

  getDotExpectedDuration(event: ApplyDebuffEvent | RefreshDebuffEvent): number {
    const fromHardcast = getHardcast(event);
    if (fromHardcast) {
      return RIP_DURATION_BASE + RIP_DURATION_PER_CP * getComboPointsFromEvent(fromHardcast);
    }
    const fromPrimalWrath = getPrimalWrath(event);
    if (fromPrimalWrath) {
      return (
        PRIMAL_WRATH_RIP_DURATION_BASE +
        PRIMAL_WRATH_RIP_DURATION_PER_CP * getComboPointsFromEvent(fromPrimalWrath)
      );
    }

    console.warn(
      "Couldn't find what cast produced Rip application - assuming base duration",
      event,
    );
    return RIP_DURATION_BASE;
  }

  getDotFullDuration(): number {
    return RIP_DURATION_BASE + 5 * RIP_DURATION_PER_CP;
  }

  getTotalDotUptime(): number {
    return this.enemies.getBuffUptime(SPELLS.RIP.id);
  }

  handleApplication(
    application: ApplyDebuffEvent | RefreshDebuffEvent,
    snapshots: string[],
    prevSnapshots: string[] | null,
    remainingOnPrev: number,
    clipped: number,
  ) {
    // TODO track downgrades
    // TODO track non-upgrade clips
  }

  onSabertoothFb(event: DamageEvent) {
    const uptimesOnTarget = this.getUptimesForTarget(event);
    // if there is an active Rip on target, extend it
    if (
      uptimesOnTarget.length > 0 &&
      uptimesOnTarget[uptimesOnTarget.length - 1].end === undefined
    ) {
      const fromHardcast = getHardcast(event);
      // convoked FB acts as though used 5 CPs
      const cpsUsed = fromHardcast ? getComboPointsFromEvent(fromHardcast) : 5;
      uptimesOnTarget[uptimesOnTarget.length - 1].expectedEnd += SABERTOOTH_EXTEND_PER_CP * cpsUsed;
    }
  }

  get uptimePercent() {
    return this.getTotalDotUptime() / this.owner.fightDuration;
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.RIP.id);
  }

  get suggestionThresholds() {
    return {
      actual: this.uptimePercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.RIP.id} /> uptime can be improved. You can refresh the DoT once
          it has reached its{' '}
          <TooltipElement content="The last 30% of the DoT's duration. When you refresh during this time you don't lose any duration in the process.">
            pandemic window
          </TooltipElement>
          , don't wait for it to wear off.
          {!this.selectedCombatant.hasTalent(SPELLS.SABERTOOTH_TALENT.id) ? (
            <>
              {' '}
              Avoid spending combo points on <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> if{' '}
              <SpellLink id={SPELLS.RIP.id} /> will need refreshing soon.
            </>
          ) : (
            <></>
          )}
        </>,
      )
        .icon(SPELLS.RIP.icon)
        .actual(
          t({
            id: 'druid.feral.suggestions.rip.uptime',
            message: `${formatPercentage(actual)}% uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  subStatistic() {
    return uptimeBarSubStatistic(
      this.owner.fight,
      {
        spells: [SPELLS.RIP],
        uptimes: this.uptimeHistory,
      },
      this.snapshotUptimes,
      SubPercentageStyle.RELATIVE,
    );
  }
}

export default RipUptime;
