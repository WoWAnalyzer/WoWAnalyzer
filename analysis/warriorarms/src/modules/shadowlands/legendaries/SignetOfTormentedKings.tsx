import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, EnergizeEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

class SignetOfTormentedKings extends Analyzer {
  // indicates that the Signet was triggered
  _signetIsUp = false;
  // records the last signet trigger timestamp to have a validity check
  _lastActivation = 0;
  // Stores the last trigger ability
  _lastSignetTrigger = 0;
  // stores the procs
  _signet_effects = {
    recklesness: 0,
    avatar: 0,
    bladestorm: 0,
  };
  // to count poor uses, meaning Ravager/Bladestorm then Avatar less than 8 seconds after
  _bad_uses = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(
      SPELLS.SIGNET_OF_TORMENTED_KINGS.bonusID,
    );

    this.addEventListener(
      Events.energize.by(SELECTED_PLAYER).spell(SPELLS.AVATAR_TALENT),
      this.onByPlayerSignetTriggeredBuff,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BLADESTORM),
      this.onByPlayerSignetTriggeredBuff,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RECKLESSNESS),
      this.onByPlayerSignetTriggeredBuff,
    );
    this.addEventListener(
      Events.energize.by(SELECTED_PLAYER).spell(SPELLS.SIGNET_OF_TORMENTED_KINGS_ENERGIZE),
      this.onByPlayerSignetTriggeredBuff,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.AVATAR_TALENT),
      this.onByPlayerSignetTriggerCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLADESTORM),
      this.onByPlayerSignetTriggerCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RAVAGER_TALENT_ARMS),
      this.onByPlayerSignetTriggerCast,
    );
  }

  onByPlayerSignetTriggeredBuff(event: ApplyBuffEvent | EnergizeEvent) {
    if (this._signetIsUp === true && event.ability.guid !== this._lastSignetTrigger) {
      if (
        event.ability.guid === SPELLS.AVATAR_TALENT.id ||
        event.ability.guid === SPELLS.SIGNET_OF_TORMENTED_KINGS_ENERGIZE.id
      ) {
        this._signet_effects.avatar += 1;
        this._signetIsUp = false;
      } else if (event.ability.guid === SPELLS.BLADESTORM.id) {
        this._signet_effects.bladestorm += 1;
        this._signetIsUp = false;
      } else if (event.ability.guid === SPELLS.RECKLESSNESS.id) {
        this._signet_effects.recklesness += 1;
        this._signetIsUp = false;
      }
    }
  }

  onByPlayerSignetTriggerCast(event: CastEvent) {
    if (
      event.ability.guid === SPELLS.AVATAR_TALENT.id &&
      (this._lastSignetTrigger === SPELLS.RAVAGER_TALENT_ARMS.id ||
        this._lastSignetTrigger === SPELLS.BLADESTORM.id) &&
      this._lastActivation > event.timestamp - 8000
    ) {
      this._bad_uses += 1;
    }
    this._lastActivation = event.timestamp;
    this._signetIsUp = true;
    this._lastSignetTrigger = event.ability.guid;
  }

  renderProcsChart() {
    const items = [
      {
        color: '#00bbcc',
        label: 'Avatar',
        spellId: SPELLS.AVATAR_TALENT.id,
        value: this._signet_effects.avatar,
        valueTooltip: `${this._signet_effects.avatar} Avatar Procs`,
      },
      {
        color: '#f37735',
        label: 'Recklesness',
        spellId: SPELLS.RECKLESSNESS.id,
        value: this._signet_effects.recklesness,
        valueTooltip: `${this._signet_effects.recklesness} Recklessness Procs`,
      },
      {
        color: '#eeff41',
        label: 'Bladestorm',
        spellId: SPELLS.BLADESTORM.id,
        value: this._signet_effects.bladestorm,
        valueTooltip: `${this._signet_effects.bladestorm} Bladestorm Procs`,
      },
    ];

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS}>
        <div className="pad">
          <label>
            <SpellLink id={SPELLS.SIGNET_OF_TORMENTED_KINGS.id} /> Procs
          </label>
          {this.renderProcsChart()}
        </div>
      </Statistic>
    );
  }

  get wasteSuggestion() {
    return {
      actual: this._bad_uses,
      isGreaterThan: 0,
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.wasteSuggestion).addSuggestion((suggest, actual) =>
      suggest(
        <>
          Try not to use{' '}
          {this.selectedCombatant.hasTalent(SPELLS.RAVAGER_TALENT_ARMS) ? (
            <SpellLink id={SPELLS.RAVAGER_TALENT_ARMS} />
          ) : (
            <SpellLink id={SPELLS.BLADESTORM} />
          )}{' '}
          right before using <SpellLink id={SPELLS.AVATAR_TALENT} />, potentially wasting{' '}
          <SpellLink id={SPELLS.SIGNET_OF_TORMENTED_KINGS} /> Procs
        </>,
      )
        .icon(SPELLS.SIGNET_OF_TORMENTED_KINGS.icon)
        .staticImportance(SUGGESTION_IMPORTANCE.MAJOR)
        .actual(<>You did it {actual} times</>),
    );
  }
}

export default SignetOfTormentedKings;
