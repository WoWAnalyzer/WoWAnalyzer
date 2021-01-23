import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import { QAPLA_KILL_COMMAND_REDUCTION_MS } from 'parser/hunter/beastmastery/constants';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { formatNumber, formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import { Trans } from '@lingui/macro';

/**
 * Barbed Shot reduces the cooldown of Kill Command by 5.0 sec.
 *
 * Example log:
 *
 */
class QaplaEredunWarOrder extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  effectiveKCReduction: number = 0;
  wastedKCReduction: number = 0;
  wastedCasts: number = 0;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.QAPLA_EREDUN_WAR_ORDER_EFFECT.bonusID);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BARBED_SHOT), this.onBarbedShotCast);
  }

  get totalPossibleCDR() {
    return Math.max(this.wastedKCReduction + this.effectiveKCReduction, 1);
  }

  get effectiveKillCommandCDRPercent() {
    return this.effectiveKCReduction / this.totalPossibleCDR;
  }

  get cdrEfficiencyKillCommandThreshold() {
    return {
      actual: this.effectiveKCReduction / this.totalPossibleCDR,
      isLessThan: {
        minor: 0.75,
        average: 0.65,
        major: 0.55,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onBarbedShotCast() {
    const killCommandIsOnCooldown = this.spellUsable.isOnCooldown(SPELLS.KILL_COMMAND_CAST_BM.id);
    if (killCommandIsOnCooldown) {
      const reductionMs = this.spellUsable.reduceCooldown(SPELLS.KILL_COMMAND_CAST_BM.id, QAPLA_KILL_COMMAND_REDUCTION_MS);
      this.effectiveKCReduction += reductionMs;
      this.wastedKCReduction += (QAPLA_KILL_COMMAND_REDUCTION_MS - reductionMs);
    } else {
      this.wastedCasts += 1;
      this.wastedKCReduction += QAPLA_KILL_COMMAND_REDUCTION_MS;
    }
  }

  suggestions(when: When) {
    when(this.cdrEfficiencyKillCommandThreshold).addSuggestion((suggest, actual, recommended) => suggest(<>When using <SpellLink id={SPELLS.QAPLA_EREDUN_WAR_ORDER_EFFECT.id} /> you want to ideally only use <SpellLink id={SPELLS.BARBED_SHOT.id} /> when <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} /> has as much cooldown remaining as possible to gain the most out of its effect - but you still don't want to be capping on <SpellLink id={SPELLS.BARBED_SHOT.id} /> charges. </>)
      .icon(SPELLS.QAPLA_EREDUN_WAR_ORDER_EFFECT.icon)
      .actual(<Trans id='hunter.beastmastery.suggestions.items.qapla.actual'>You had {formatPercentage(actual)}% effective cooldown reduction of Kill Command </Trans>)
      .recommended(<Trans id='hunter.beastmastery.suggestions.items.qapla.recommended'> {'>'}{formatPercentage(recommended, 0)}% is recommended</Trans>));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={(
          <>
            {this.wastedCasts > 0 &&
            <>You had {this.wastedCasts} {this.wastedCasts > 1 ? 'casts' : 'cast'} of Cobra Shot when Kill Command wasn't on cooldown. </>}
            {this.wastedCasts > 0 && this.wastedKCReduction > 0 && <br />}
            {this.wastedKCReduction > 0 &&
            `You wasted ${(this.wastedKCReduction / 1000).toFixed(2)} seconds of potential cooldown reduction by casting Barbed Shot while Kill Command had less than 4 seconds remaining on its CD.`}
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.QAPLA_EREDUN_WAR_ORDER_EFFECT}>
          <>
            {formatNumber(this.effectiveKCReduction / 1000)}s / {this.totalPossibleCDR / 1000}s
            <br />
            {formatPercentage(this.effectiveKCReduction / this.totalPossibleCDR)}% <small>effectiveness</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default QaplaEredunWarOrder;
