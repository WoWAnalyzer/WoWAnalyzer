import { defineMessage } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink, TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

class RenewingMistDuringManaTea extends Analyzer {
  // tracks how long we had mana tea :)
  manaTeaDuration = 0;

  manaTeaActive = false;
  manaTeaStartTime = 0;
  lastTimeStamp = 0;

  dataHolder: Map<number, number> = new Map<number, number>();

  currentRenewingMists = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.MANA_TEA_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.MANA_TEA_TALENT),
      this.manaTeaStart,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.MANA_TEA_TALENT),
      this.manaTeaEnd,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.applyRenewingMist,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.removeRenewingMist,
    );
  }

  manaTeaStart(event: ApplyBuffEvent) {
    this.manaTeaActive = true;
    this.lastTimeStamp = event.timestamp;
    this.manaTeaStartTime = event.timestamp;
  }

  manaTeaEnd(event: RemoveBuffEvent) {
    this.manaTeaDuration += event.timestamp - this.manaTeaStartTime;
    this.handleAdjustment(event);
    this.manaTeaActive = false;
  }

  applyRenewingMist(event: ApplyBuffEvent) {
    this.currentRenewingMists += 1;
    this.handleAdjustment(event);
  }

  removeRenewingMist(event: RemoveBuffEvent) {
    this.currentRenewingMists -= 1;
    this.handleAdjustment(event);
  }

  handleAdjustment(event: ApplyBuffEvent | RemoveBuffEvent) {
    if (!this.manaTeaActive) {
      return;
    }

    if (!this.dataHolder.has(this.currentRenewingMists)) {
      this.dataHolder.set(this.currentRenewingMists, 0);
    }

    let currentDuration = this.dataHolder.get(this.currentRenewingMists)!;
    currentDuration += event.timestamp - this.lastTimeStamp;
    this.dataHolder.set(this.currentRenewingMists, currentDuration);

    this.lastTimeStamp = event.timestamp;
  }

  get avgRemDuringMT() {
    // calculate stats first
    let total = 0;

    this.dataHolder.forEach((duration, activeREMs) => {
      total += activeREMs * (duration / this.manaTeaDuration);
    });

    return total;
  }

  get suggestionThresholds() {
    return {
      actual: this.avgRemDuringMT,
      isLessThan: {
        minor: 2,
        average: 1.5,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          During <SpellLink spell={TALENTS_MONK.MANA_TEA_TALENT} /> you should have a minimum of two{' '}
          <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> out to maximize your healing
          during the buff.
        </>,
      )
        .icon(TALENTS_MONK.MANA_TEA_TALENT.icon)
        .actual(
          `${this.avgRemDuringMT.toFixed(2)}${defineMessage({
            id: 'monk.mistweaver.suggestions.renewingMistDuringManaTea.avgRenewingMists',
            message: ` average Renewing Mists during Mana Tea`,
          })}`,
        )
        .recommended(`${recommended} average Renewing Mists recommended`),
    );
  }

  subStatistic() {
    return (
      <TooltipElement
        content={<>This is the average number of Renewing Mists active during Mana Tea</>}
      >
        {this.avgRemDuringMT.toFixed(2)} <small>average renewing mists</small>
      </TooltipElement>
    );
  }
}

export default RenewingMistDuringManaTea;
