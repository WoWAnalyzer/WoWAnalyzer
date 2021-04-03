import { Trans } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import { QAPLA_BARBED_SHOT_DMG_INCREASE } from '@wowanalyzer/hunter-beastmastery/src/constants';

/**
 * Barbed Shot damage increased by 10% and Barbed Shot casts reset Kill Command.
 *
 * Example log: https://www.warcraftlogs.com/reports/cPH3FrGRyZLQJ4aK#fight=2&type=damage-done&source=17
 *
 */
class QaplaEredunWarOrder extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  barbedShotCasts: number = 0;
  wastedCasts: number = 0;
  killCommandResets: number = 0;
  barbedShotBonusDamage: number = 0;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(
      SPELLS.QAPLA_EREDUN_WAR_ORDER_EFFECT.bonusID,
    );
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BARBED_SHOT),
      this.onBarbedShotCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BARBED_SHOT),
      this.onBarbedShotDamage,
    );
  }

  get killCommandResetsThreshold() {
    return {
      actual: this.killCommandResets / this.barbedShotCasts,
      isLessThan: {
        minor: 0.85,
        average: 0.75,
        major: 0.65,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onBarbedShotCast(event: CastEvent) {
    const killCommandIsOnCooldown = this.spellUsable.isOnCooldown(SPELLS.KILL_COMMAND_CAST_BM.id);
    this.barbedShotCasts += 1;
    if (killCommandIsOnCooldown) {
      this.spellUsable.endCooldown(SPELLS.KILL_COMMAND_CAST_BM.id, false, event.timestamp);
      this.killCommandResets += 1;
    } else {
      this.wastedCasts += 1;
    }
  }

  onBarbedShotDamage(event: DamageEvent) {
    this.barbedShotBonusDamage += calculateEffectiveDamage(event, QAPLA_BARBED_SHOT_DMG_INCREASE);
  }

  suggestions(when: When) {
    when(this.killCommandResetsThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          When using <SpellLink id={SPELLS.QAPLA_EREDUN_WAR_ORDER_EFFECT.id} /> you want to ideally
          only use <SpellLink id={SPELLS.BARBED_SHOT.id} /> when{' '}
          <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} /> is on cooldown to gain the most out of
          its effect - but you still don't want to be capping on{' '}
          <SpellLink id={SPELLS.BARBED_SHOT.id} /> charges.{' '}
        </>,
      )
        .icon(SPELLS.QAPLA_EREDUN_WAR_ORDER_EFFECT.icon)
        .actual(
          <Trans id="hunter.beastmastery.suggestions.items.qapla.actual">
            You had {formatPercentage(actual)}% of your Barbed Shots reset Kill Command{' '}
          </Trans>,
        )
        .recommended(
          <Trans id="hunter.beastmastery.suggestions.items.qapla.recommended">
            {' '}
            {'>'}
            {formatPercentage(recommended, 0)}% is recommended
          </Trans>,
        ),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            You had {this.wastedCasts} {this.wastedCasts > 1 ? 'casts' : 'cast'} of Cobra Shot when
            Kill Command wasn't on cooldown.{' '}
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.QAPLA_EREDUN_WAR_ORDER_EFFECT}>
          <>
            {formatNumber(this.barbedShotBonusDamage)} <small>Bonus Barbed Shot damage</small>
            <br />
            {this.killCommandResets} <small>Kill Command Resets</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default QaplaEredunWarOrder;
