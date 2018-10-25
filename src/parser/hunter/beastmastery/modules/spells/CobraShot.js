import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import Abilities from 'parser/shared/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

/**
 * A quick shot causing Physical damage.
 * Reduces the cooldown of Kill Command by 1 sec.
 */

const COOLDOWN_REDUCTION_MS = 1000;

class CobraShot extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  effectiveKCReductionMs = 0;
  wastedKCReductionMs = 0;
  wastedCasts = 0;

  get totalPossibleCDR() {
    return (this.wastedKCReductionMs + this.effectiveKCReductionMs);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.COBRA_SHOT.id) {
      return;
    }
    if (!this.spellUsable.isOnCooldown(SPELLS.KILL_COMMAND.id)) {
      this.wastedCasts += 1;
      this.wastedKCReductionMs += COOLDOWN_REDUCTION_MS;
      return;
    }
    const effectiveReductionMs = this.spellUsable.reduceCooldown(SPELLS.KILL_COMMAND.id, COOLDOWN_REDUCTION_MS);
    this.effectiveKCReductionMs += effectiveReductionMs;
    this.wastedKCReductionMs += (COOLDOWN_REDUCTION_MS - effectiveReductionMs);
  }

  get cdrEfficiencyCobraShotThreshold() {
    return {
      actual: this.effectiveKCReductionMs / this.totalPossibleCDR,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  get wastedCobraShotsThreshold() {
    return {
      actual: this.wastedCasts,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.cdrEfficiencyCobraShotThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>A crucial part of <SpellLink id={SPELLS.COBRA_SHOT.id} /> is the cooldown reduction of <SpellLink id={SPELLS.KILL_COMMAND.id} /> it provides. Therefore it's important to be casting <SpellLink id={SPELLS.KILL_COMMAND.id} /> as often as possible to ensure you'll be wasting as little potential cooldown reduction as possible.</>)
        .icon(SPELLS.COBRA_SHOT.icon)
        .actual(`You had ${formatPercentage(actual)}% effective cooldown reduction of Kill Command`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
    when(this.wastedCobraShotsThreshold).addSuggestion((suggest, actual) => {
      return suggest(<>You should never cast <SpellLink id={SPELLS.COBRA_SHOT.id} /> when <SpellLink id={SPELLS.KILL_COMMAND.id} /> is off cooldown.</>)
        .icon(SPELLS.COBRA_SHOT.icon)
        .actual(`You cast ${actual} Cobra Shots when Kill Command wasn't on cooldown`)
        .recommended(`0 casts is recommended`);
    });
  }
  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(15)}
        icon={<SpellIcon id={SPELLS.COBRA_SHOT.id} />}
        value={(
          <>
            {formatNumber(this.effectiveKCReductionMs / 1000)}s / {this.totalPossibleCDR / 1000}s
            <br />
            {formatPercentage(this.effectiveKCReductionMs / this.totalPossibleCDR)}%
          </>
        )}
        label={<><SpellLink id={SPELLS.KILL_COMMAND.id} icon={false} /> CDR</>}
        tooltip={``}
      />
    );
  }
}

export default CobraShot;
