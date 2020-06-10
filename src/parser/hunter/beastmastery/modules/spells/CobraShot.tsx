import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import GlobalCooldown from 'parser/hunter/beastmastery/modules/core/GlobalCooldown';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events, { CastEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

/**
 * A quick shot causing Physical damage.
 * Reduces the cooldown of Kill Command by 1 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/bf3r17Yh86VvDLdF#fight=8&type=damage-done&source=1&ability=193455
 */

const COOLDOWN_REDUCTION_MS = 1000;
const FOCUS_THRESHOLD_TO_WAIT = 50; //A threshold where you can never realistically overcap on focus by waiting for AT MOST 1 GCD + 1 second.
class CobraShot extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    globalCooldown: GlobalCooldown,
  };

  effectiveKCReductionMs = 0;
  wastedKCReductionMs = 0;
  wastedCasts = 0;
  casts = 0;

  protected spellUsable!: SpellUsable;
  protected globalCooldown!: GlobalCooldown;

  constructor(options: any) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.COBRA_SHOT), this.onCobraShotCast);
  }

  get totalPossibleCDR() {
    return this.casts * COOLDOWN_REDUCTION_MS;
  }

  get wastedCDR() {
    return this.wastedKCReductionMs / 1000;
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

  onCobraShotCast(event: CastEvent) {
    if (event.meta === undefined) {
      event.meta = {
        isInefficientCast: false,
        inefficientCastReason: '',
      };
    }
    this.casts += 1;
    if (!this.spellUsable.isOnCooldown(SPELLS.KILL_COMMAND_CAST_BM.id)) {
      this.wastedCasts += 1;
      this.wastedKCReductionMs += COOLDOWN_REDUCTION_MS;
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'Cobra Shot cast while Kill Command is not on cooldown.';
      return;
    }
    const globalCooldown = this.globalCooldown.getGlobalCooldownDuration(SPELLS.COBRA_SHOT.id);
    const killCommandCooldownRemaining = this.spellUsable.cooldownRemaining(
      SPELLS.KILL_COMMAND_CAST_BM.id);
    if (killCommandCooldownRemaining < COOLDOWN_REDUCTION_MS + globalCooldown) {
      const effectiveReductionMs = killCommandCooldownRemaining -
        globalCooldown;
      this.effectiveKCReductionMs += this.spellUsable.reduceCooldown(SPELLS.KILL_COMMAND_CAST_BM.id, effectiveReductionMs);
      this.wastedKCReductionMs += COOLDOWN_REDUCTION_MS - effectiveReductionMs;

      const resource = event.classResources?.find(resource => resource.type === RESOURCE_TYPES.FOCUS.id);
      if (!resource) {
        return;
      }
      if (resource.amount < FOCUS_THRESHOLD_TO_WAIT) {
        event.meta.isInefficientCast = true;
        event.meta.inefficientCastReason = 'Cobra Shot cast while Kill Command\'s cooldown was under ' + (globalCooldown + COOLDOWN_REDUCTION_MS / 1000).toFixed(1) + 's remaining and you were not close to capping focus as you only had ' + (resource.amount) + ' focus.';
      }
    } else {
      this.effectiveKCReductionMs += this.spellUsable.reduceCooldown(SPELLS.KILL_COMMAND_CAST_BM.id, COOLDOWN_REDUCTION_MS);
    }
  }

  suggestions(when: any) {
    when(this.cdrEfficiencyCobraShotThreshold).addSuggestion((suggest: any, actual: any, recommended: any) => {
      return suggest(<>A crucial part of <SpellLink id={SPELLS.COBRA_SHOT.id} /> is the cooldown reduction of <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} /> it provides. When the cooldown of <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} /> is larger than the duration of your GCD + 1s, you'll want to be casting <SpellLink id={SPELLS.COBRA_SHOT.id} /> to maximize the amount of casts of <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} />. If the cooldown of <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} /> is lower than GCD + 1s, you'll only want to be casting <SpellLink id={SPELLS.COBRA_SHOT.id} />, if you'd be capping focus otherwise.</>)
        .icon(SPELLS.COBRA_SHOT.icon)
        .actual(`You had ${formatPercentage(actual)}% effective cooldown reduction of Kill Command`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
    when(this.wastedCobraShotsThreshold).addSuggestion((suggest: any, actual: any) => {
      return suggest(<>You should never cast <SpellLink id={SPELLS.COBRA_SHOT.id} /> when <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} /> is off cooldown.</>)
        .icon(SPELLS.COBRA_SHOT.icon)
        .actual(`You cast ${actual} Cobra Shots when Kill Command wasn't on cooldown`)
        .recommended(`0 inefficient casts  is recommended`);
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        tooltip={(
          <>
            {this.wastedCasts > 0 &&
            <>You had {this.wastedCasts} {this.wastedCasts > 1 ? 'casts' : 'cast'} of Cobra Shot when Kill Command wasn't on cooldown. </>}
            {this.wastedCasts > 0 && this.wastedKCReductionMs > 0 && <br />}
            {this.wastedKCReductionMs > 0 &&
            `You wasted ${this.wastedCDR.toFixed(2)} seconds of potential cooldown reduction by casting Cobra Shot while Kill Command had less than 1 + GCD seconds remaining on its CD.`}
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.COBRA_SHOT}>
          <>
            {formatNumber(this.effectiveKCReductionMs / 1000)}s / {this.totalPossibleCDR / 1000}s <br />
            {formatPercentage(this.effectiveKCReductionMs / this.totalPossibleCDR)}% <small>effectiveness</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CobraShot;
