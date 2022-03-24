import SPELLS from 'common/SPELLS';
import conduits from 'common/SPELLS/shadowlands/conduits';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { ApplyBuffStackEvent, ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { When, ThresholdStyle } from 'parser/core/ParseResults';

class UntemperedDedication extends Analyzer {
  // Warcraft Logs seems to have issues with the stack status at fight start
  // we do not know how many stacks the character has and how long it has until expiration
  // in WoWA we have a prepull apply buff with the same lack of info
  // Realistically, people start at 5 stacks, or _isFullStack is going to turn to false on the first applyBuff or applyBuffStack
  // the only issue is that the first LOTM may be considered wasteful when it is not.
  _isFullStack = true;
  // There is also no buff event generated when LOTM is cast while there are already 5 stacks
  // so we are maintaining the date of the last refresh here.
  _lastFullStackRefresh = 0;
  // a counter for when LOTM stacks are dropped
  _totalDrops = 0;
  // tracker for number of current stacks
  _currentStacks = 5;
  conduitRank = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.UNTEMPERED_DEDICATION.id);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.UNTEMPERED_DEDICATION.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.UNTEMPERED_DEDICATION_BUFF),
      this.onByPlayerUntemperedDedicationBuff,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.UNTEMPERED_DEDICATION_BUFF),
      this.onByPlayerUntemperedDedicationInitialBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.UNTEMPERED_DEDICATION_BUFF),
      this.onByPlayerUntemperedDedicationBuffRemoval,
    );
  }

  /**
   * Sets _isFullStack to true if there are now 5 stacks, as well as the last refresh
   * NB: it comes after the LOTM Cast
   * @param event indicate the new number of stacks (only positive increments)
   */
  onByPlayerUntemperedDedicationBuff(event: ApplyBuffStackEvent) {
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
   * first LOTM generates a ApplyBuffStack or ApplyBuff event
   * Note 2: Technically, the only time this function does something is on the first
   * apply buff if there was no prepull UD.
   * @param event with info about first stack, or prepull incomplete indication
   */
  onByPlayerUntemperedDedicationInitialBuff(event: ApplyBuffEvent) {
    if (event.prepull !== true) {
      this._isFullStack = false;
      this._currentStacks = 1;
    }
  }

  onByPlayerUntemperedDedicationBuffRemoval(event: RemoveBuffEvent) {
    this._totalDrops += 1;
    this._isFullStack = false;
    this._currentStacks = 0;
  }

  get dropSuggestion() {
    return {
      actual: this._totalDrops,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.dropSuggestion).addSuggestion((suggest, actual) =>
      suggest(
        <span>
          You dropped your Untempered Dedication stacks {actual} times. Try to keep it up at all
          times, as this is a fairly large loss of healing.
        </span>,
      )
        .icon(conduits.UNTEMPERED_DEDICATION.icon)
        .staticImportance(SUGGESTION_IMPORTANCE.MAJOR)
        .actual(<>You lost your stacks {actual} times</>)
        .recommended(<>It is recommended to maintain 5 stacks at all times.</>),
    );
  }
}

export default UntemperedDedication;
