import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ApplyBuffStackEvent, ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

class FlashConcentration extends Analyzer {
  // Warcraft Logs seems to have issues with the stack status at fight start
  // plus realistically, people start at 5 stacks, or _isFullStack is going to turn to false on the first Flash of Light cast
  _isFullStack = true;
  _lastFullStackRefresh = 0;
  _wastefulCasts = 0;
  _totalDrops = 0;

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
  }

  onByPlayerFlashConcentrationBuff(event: ApplyBuffStackEvent) {
    console.log(event.timestamp);
    console.log(`it is a buff stack ${event.stack}`);
    if (event.stack === 5) {
      this._isFullStack = true;
      this._lastFullStackRefresh = event.timestamp;
    } else {
      this._isFullStack = false;
    }
  }

  onByPlayerFlashConcentrationInitialBuff(event: ApplyBuffEvent) {
    console.log(event.timestamp);
    console.log('it is the initial Buff');
    this._isFullStack = false;
  }

  onByPlayerFlashConcentrationBuffRemoval(event: RemoveBuffEvent) {
    this._totalDrops += 1;
    this._isFullStack = false;
    console.log(event.timestamp);
    console.log('it is a buff removal');
  }

  onByPlayerFlashHealCast(event: CastEvent) {
    console.log(event.timestamp);
    console.log(this._isFullStack);
    console.log(event.timestamp - this._lastFullStackRefresh);
    console.log('Flash Heal FTW!');
    if (this._isFullStack) {
      if (event.timestamp - this._lastFullStackRefresh < 15000) {
        this._wastefulCasts += 1;
      }
      this._lastFullStackRefresh = event.timestamp;
    }
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS} tooltip={<>Hello World</>}>
        <ItemHealingDone amount={125} />
        <SpellLink id={SPELLS.FLASH_CONCENTRATION.id}></SpellLink>
        You let the buff drop {this._totalDrops} times You had bad refresh {this._wastefulCasts}{' '}
        times
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
            You used {actual} <SpellLink id={SPELLS.FLASH_HEAL.id} /> while there were more than 5
            seconds left of <SpellLink id={SPELLS.FLASH_CONCENTRATION.id} />,
          </>,
        )
        .recommended(<>No inefficient cast is recommended</>),
    );
  }
}

export default FlashConcentration;
