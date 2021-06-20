import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AnyEvent, CastEvent, DamageEvent } from 'parser/core/Events';
import { isFromHardcast } from '../../normalizers/CastLinkNormalizer';
import ConvokeSpiritsFeral from '../shadowlands/ConvokeSpiritsFeral';
import { FINISHERS } from '../../constants';
import { SpellLink } from 'interface';
import React from 'react';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { formatPercentage } from 'common/format';

const BUFFER_MS = 50;

/**
 * **Bloodtalons** - Talent lvl 50
 *
 * When you use 3 different combo point-generating abilities within 4 sec,
 * the damage of your next 2 Rips or Ferocious Bites is increased by 30%.
 * --------------------------------
 * This module specifically tracks Ferocious Bite's benefit from Bloodtalons.
 * Rip benefits are handled in RipUptimeAndSnapshots.
 */
// TODO also track which builders caused the proc?
class Bloodtalons2 extends Analyzer {
  static dependencies = {
    convokeSpirits: ConvokeSpiritsFeral,
  };

  protected convokeSpirits!: ConvokeSpiritsFeral;
  hasApex: boolean;

  // TODO build stat and use these?
  apexBites: number = 0;
  convokeBites: number = 0;
  regBites: number = 0;

  apexBitesWithBt: number = 0;
  convokeBitesWithBt: number = 0;
  regBitesWithBt: number = 0;

  /**
   * Normally, every regular hardcast FB should be buffed by BT, but we allow the following exceptions:
   * * Player consumed BT on an Apex bite since the last finisher
   * * Player consumed BT on Convoke since the last finisher
   * * Player is Berserk/Incarn (might not be enough builders to proc BT due to crits)
   *
   * If none of these exceptions apply and the FB didn't benefit from BT, we increment this.
   */
  badBites: number = 0;
  /** Number of regular hardcast FB that either benefitted from BT or had an exception */
  correctBites: number = 0;
  exceptionSinceLastFinisher: boolean = false;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.BLOODTALONS_TALENT);
    this.hasApex = this.selectedCombatant.hasLegendaryByBonusID(
      SPELLS.APEX_PREDATORS_CRAVING.bonusID,
    );

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(FINISHERS), this.onFinisherCast);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEROCIOUS_BITE),
      this.onFbDamage,
    );
  }

  onFinisherCast(event: CastEvent) {
    if (event.ability.guid === SPELLS.FEROCIOUS_BITE.id) {
      const fromApex =
        this.hasApex &&
        this.selectedCombatant.hasBuff(
          SPELLS.APEX_PREDATORS_CRAVING_BUFF.id,
          event.timestamp,
          BUFFER_MS,
        );
      const hasBt = this._hasBt(event);
      if (hasBt) {
        if (fromApex) {
          this.exceptionSinceLastFinisher = true;
          return;
        } else {
          this.correctBites += 1;
        }
      } else if (!fromApex) {
        if (this.exceptionSinceLastFinisher || this._isBerserkOrIncarn(event)) {
          this.correctBites += 1;
        } else {
          this.badBites += 1;
        }
      }
    }

    this.exceptionSinceLastFinisher = false;
  }

  onFbDamage(event: DamageEvent) {
    if (!isFromHardcast(event) && this.convokeSpirits.isConvoking() && this._hasBt(event)) {
      this.exceptionSinceLastFinisher = true;
    }
  }

  _hasBt(event: AnyEvent): boolean {
    return this.selectedCombatant.hasBuff(SPELLS.BLOODTALONS_BUFF.id, event.timestamp, BUFFER_MS);
  }

  _isBerserkOrIncarn(event: AnyEvent): boolean {
    return (
      this.selectedCombatant.hasBuff(SPELLS.BERSERK.id) ||
      this.selectedCombatant.hasBuff(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id)
    );
  }

  get totalRegularBites() {
    return this.badBites + this.correctBites;
  }

  get percentCorrectBites() {
    return this.totalRegularBites === 0 ? 1 : this.correctBites / this.totalRegularBites;
  }

  get correctFbSuggestionThresholds() {
    return {
      actual: this.percentCorrectBites,
      isLessThan: {
        minor: 1,
        average: 0.8,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.correctFbSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are casting <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> without{' '}
          <SpellLink id={SPELLS.BLOODTALONS_TALENT.id} />. With only a few exceptions, you should be
          able to buff each of your Bites with Bloodtalons.
          <br /><br />
          The exceptions are: you have <SpellLink id={SPELLS.BERSERK.id} /> or{' '}
          <SpellLink id={SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id} /> active and don't have
          enough combo builders between finishers to proc Bloodtalons, or your{' '}
          <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} /> consumed Bloodtalons before your finisher
          {this.hasApex && (
            <>
              , or your <SpellLink id={SPELLS.APEX_PREDATORS_CRAVING.id} /> proc consumed
              Bloodtalons before your finisher
            </>
          )}
          . These exceptions are accounted for by the below statistic.
        </>,
      )
        .icon(SPELLS.BLOODTALONS_TALENT.icon)
        .actual(`${formatPercentage(actual, 1)}% correct Bloodtalon Ferocious Bites.`)
        .recommended(`${formatPercentage(recommended, 0)}% is recommended`),
    );
  }
}

export default Bloodtalons2;
