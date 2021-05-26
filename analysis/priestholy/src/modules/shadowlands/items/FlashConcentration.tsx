import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { ApplyBuffStackEvent, ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

/**
 * An Analyzer for Flash Concentration:
 * - statistic: HPS added to Heal Casts.
 * - statistic: Cast Time gained on Heal thanks to FC
 * - suggestion: when too many FC Drops.
 * - suggestion: when too many wasteful Flash Heal Casts.
 */
class FlashConcentration extends Analyzer {
  // Warcraft Logs seems to have issues with the stack status at fight start
  // we do not know how many stacks the character has and how long it has until expiration
  // in WoWA we have a prepull apply buff with the same lack of info
  // Realistically, people start at 5 stacks, or _isFullStack is going to turn to false on the first applyBuff or applyBuffStack
  // the only issue is that the first Flash Heal may be considered wasteful when it is not.
  _isFullStack = true;
  // There is also no buff event generated when Flash Heal is cast while there are already 5 stacks
  // so we are maintaining the date of the last refresh here.
  _lastFullStackRefresh = 0;
  // a Counter for wasteful Flash Heal Casts
  _wastefulCasts = 0;
  // a counter for when FC stacks are dropped
  _totalDrops = 0;
  // tracker for number of current stacks
  _currentStacks = 5;
  // cumulated gained healing and cast time on every buffed Heal Cast, plus the totals
  _totalHeal = 0;
  _gainedHeal = 0;
  _gainedCastTime = 0;
  _totalCastTime = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.FLASH_CONCENTRATION),
      this.onByPlayerFlashConcentrationBuff,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FLASH_CONCENTRATION),
      this.onByPlayerFlashConcentrationInitialBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.FLASH_CONCENTRATION),
      this.onByPlayerFlashConcentrationBuffRemoval,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FLASH_HEAL),
      this.onByPlayerFlashHealCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GREATER_HEAL),
      this.onByPlayerHealAmount,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.GREATER_HEAL),
      this.onByPlayerHealCast,
    );
  }

  /**
   * Sets _isFullStack to true if there are now 5 stacks, as well as the last refresh
   * NB: it comes after the Flash Heal Cast
   * @param event indicate the new number of stacks (only positive increments)
   */
  onByPlayerFlashConcentrationBuff(event: ApplyBuffStackEvent) {
    if (event.stack === 5) {
      this._isFullStack = true;
      this._lastFullStackRefresh = event.timestamp;
    } else {
      this._isFullStack = false;
    }
    this._currentStacks = event.stack;
  }

  /**
   * Sets _isFullStack to false.
   * Note: The only exception is the prepull event, for which we assume that
   * it means the character has five stacks. It will be corrected if the
   * first Flash Heal generates a ApplyBuffStack or ApplyBuff event
   * Note 2: Technically, the only time this function does something is on the first
   * apply buff if there was no prepull FC.
   * @param event with info about first stack, or prepull incomplete indication
   */
  onByPlayerFlashConcentrationInitialBuff(event: ApplyBuffEvent) {
    if (event.prepull !== true) {
      this._isFullStack = false;
      this._currentStacks = 1;
    }
  }

  /**
   * Increments _totalDrops for our suggestion, since that should ideally not happen
   */
  onByPlayerFlashConcentrationBuffRemoval(event: RemoveBuffEvent) {
    this._totalDrops += 1;
    this._isFullStack = false;
    this._currentStacks = 0;
  }

  /**
   * when at full stack, it refreshes the last refresh timer,
   * and counts a Wasteful Cast if it was used earlier than needed
   */
  onByPlayerFlashHealCast(event: CastEvent) {
    if (this._isFullStack) {
      if (event.timestamp - this._lastFullStackRefresh < 15000) {
        this._wastefulCasts += 1;
      }
      this._lastFullStackRefresh = event.timestamp;
    }
  }

  onByPlayerHealAmount(event: HealEvent) {
    this._totalHeal += event.amount;
    this._gainedHeal +=
      (event.amount * (this._currentStacks * 0.03)) / (1 + this._currentStacks * 0.03);
    this._gainedCastTime += this._currentStacks * 200;
  }

  onByPlayerHealCast(event: CastEvent) {
    this._totalCastTime +=
      event.timestamp -
      (event.channel?.beginChannel?.timestamp
        ? event.channel.beginChannel.timestamp
        : event.timestamp);
  }

  statistic() {
    // HealHPSNoFC gives the HPS which would have been obtained by casting the same number of heals without Flash Concentration Buff
    const HealHPSNoFC =
      (this._totalHeal - this._gainedHeal) / (this._totalCastTime + this._gainedCastTime);
    // BuffedHealHPS gives the total HPS of Heal in this fight
    const BuffedHealHPS = this._totalHeal / this._totalCastTime;
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            Impact is approximative since <SpellLink id={SPELLS.FLASH_CONCENTRATION.id} /> modifies
            the gameplay in depth
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.FLASH_CONCENTRATION}>
          <ItemHealingDone
            // approximate considering the player would have cast heal without FC
            amount={(BuffedHealHPS - HealHPSNoFC) * this._totalCastTime}
            approximate
          />
          <br />
          {this._gainedCastTime / 1000} sec saved on <SpellLink id={SPELLS.GREATER_HEAL.id} /> casts
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get dropSuggestion() {
    return {
      actual: this._totalDrops,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get wastefulFlashHealSuggestion() {
    return {
      actual: this._wastefulCasts,
      isGreaterThan: {
        minor: 0,
        average: (2 * this.owner.fightDuration) / 1000 / 60,
        major: (4 * this.owner.fightDuration) / 1000 / 60,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.dropSuggestion).addSuggestion((suggest, actual) =>
      suggest(
        <span>
          You dropped your <SpellLink id={SPELLS.FLASH_CONCENTRATION.id}></SpellLink> stacks{' '}
          {actual} times. Try to keep it up at all times.
        </span>,
      )
        .icon(SPELLS.FLASH_CONCENTRATION.icon)
        .staticImportance(SUGGESTION_IMPORTANCE.MAJOR)
        .actual(<>You lost your stacks {actual} times</>)
        .recommended(<>It is recommended to maintain 5 stacks at all times</>),
    );

    when(this.wastefulFlashHealSuggestion).addSuggestion((suggest, actual) =>
      suggest(
        <span>
          You used too many unnecessary <SpellLink id={SPELLS.FLASH_HEAL.id} /> while you had 5
          stacks of <SpellLink id={SPELLS.FLASH_CONCENTRATION.id}></SpellLink>
        </span>,
      )
        .icon(SPELLS.FLASH_CONCENTRATION.icon)
        .actual(
          <>
            You cast {actual} times while there were more than 5 seconds left of{' '}
            <SpellLink id={SPELLS.FLASH_CONCENTRATION.id} />,
          </>,
        )
        .recommended(<>No inefficient cast is recommended</>),
    );
  }
}

export default FlashConcentration;
