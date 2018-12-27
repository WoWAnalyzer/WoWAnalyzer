import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import GlobalCooldown from 'parser/hunter/beastmastery/modules/core/GlobalCooldown';

/**
 * A quick shot causing Physical damage.
 * Reduces the cooldown of Kill Command by 1 sec.
 */

const COOLDOWN_REDUCTION_MS = 1000;

class CobraShot extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    globalCooldown: GlobalCooldown,
  };

  effectiveKCReductionMs = 0;
  wastedKCReductionMs = 0;
  wastedCasts = 0;
  casts = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.COBRA_SHOT.id) {
      return;
    }
    this.casts += 1;
    if (!this.spellUsable.isOnCooldown(SPELLS.KILL_COMMAND_CAST_BM.id)) {
      this.wastedCasts += 1;
      this.wastedKCReductionMs += COOLDOWN_REDUCTION_MS;
      return;
    }
    const globalCooldown = this.globalCooldown.getGlobalCooldownDuration(spellId);
    const killCommandCooldownRemaining = this.spellUsable.cooldownRemaining(SPELLS.KILL_COMMAND_CAST_BM.id);
    if (killCommandCooldownRemaining < COOLDOWN_REDUCTION_MS + globalCooldown) {
      const effectiveReductionMs = killCommandCooldownRemaining - globalCooldown;
      this.effectiveKCReductionMs += this.spellUsable.reduceCooldown(SPELLS.KILL_COMMAND_CAST_BM.id, effectiveReductionMs);
      this.wastedKCReductionMs += COOLDOWN_REDUCTION_MS - effectiveReductionMs;
      return;
    }
    this.effectiveKCReductionMs += this.spellUsable.reduceCooldown(SPELLS.KILL_COMMAND_CAST_BM.id, COOLDOWN_REDUCTION_MS);
  }

  get totalPossibleCDR() {
    return this.casts * COOLDOWN_REDUCTION_MS;
  }

  get wastedCDR() {
    return (this.wastedKCReductionMs / 1000).toFixed(2);
  }

  get cdrEfficiencyCobraShotThreshold() {
    return {
      actual: this.effectiveKCReductionMs / this.totalPossibleCDR,
      isLessThan: {
        minor: 0.85,
        average: 0.8,
        major: 0.75,
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
      return suggest(<>A crucial part of <SpellLink id={SPELLS.COBRA_SHOT.id} /> is the cooldown reduction of <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} /> it provides. When the cooldown of <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} /> is larger than the duration of your GCD + 1s, you'll want to be casting <SpellLink id={SPELLS.COBRA_SHOT.id} /> to maximize the amount of casts of <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} />. If the cooldown of <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} /> is lower than GCD + 1s, you'll only want to be casting <SpellLink id={SPELLS.COBRA_SHOT.id} />, if you'd be capping focus otherwise.</>)
        .icon(SPELLS.COBRA_SHOT.icon)
        .actual(`You had ${formatPercentage(actual)}% effective cooldown reduction of Kill Command`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
    when(this.wastedCobraShotsThreshold).addSuggestion((suggest, actual) => {
      return suggest(<>You should never cast <SpellLink id={SPELLS.COBRA_SHOT.id} /> when <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} /> is off cooldown.</>)
        .icon(SPELLS.COBRA_SHOT.icon)
        .actual(`You cast ${actual} Cobra Shots when Kill Command wasn't on cooldown`)
        .recommended(`0 casts  is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(16)}
        icon={<SpellIcon id={SPELLS.COBRA_SHOT.id} />}
        value={(
          <>
            {formatNumber(this.effectiveKCReductionMs / 1000)}s / {this.totalPossibleCDR / 1000}s
            <br />
            {formatPercentage(this.effectiveKCReductionMs / this.totalPossibleCDR)}%
          </>
        )}
        label={<><SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} icon={false} /> CDR</>}
        tooltip={`
        ${this.wastedCasts > 0 ? `You had ${this.wastedCasts} ${this.wastedCasts > 1 ? `casts` : `cast`} of Cobra Shot when Kill Command wasn't on cooldown. <br />` : ``}
        ${this.wastedKCReductionMs > 0 ? `You wasted ${this.wastedCDR} seconds of potential cooldown reduction by casting Cobra Shot while Kill Command had less than 1+GCD seconds remaining on its CD. ` : ``}
        `}
      />
    );
  }
}

export default CobraShot;
