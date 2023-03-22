import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Combatants from 'parser/shared/modules/Combatants';
import Lifebind from './Lifebind';

const MAX_ECHO_DURATION = 18000;

class EmeraldCommunion extends Analyzer {
  static dependencies = {
    lifebind: Lifebind,
    combatants: Combatants,
  };
  protected combatants!: Combatants;
  protected lifebind!: Lifebind;
  numCasts: number = 0;
  numTaCasts: number = 0;
  percentCovered: number[] = [];
  potentialEchoTargets: Map<number, number> = new Map<number, number>();

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_EVOKER.EMERALD_COMMUNION_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS_EVOKER.LIFEBIND_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.EMERALD_COMMUNION_TALENT),
      this.onCast,
    );
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER), this.onAlly);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onAlly);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER), this.onAlly);
  }

  onAlly(event: ApplyBuffEvent | RefreshBuffEvent | HealEvent) {
    this.potentialEchoTargets.set(event.targetID, event.timestamp);
  }

  // check last time we affected a target with a buff/heal and see if it is within length of an echo
  getPotentialTargets(timestamp: number) {
    return Array.from(this.potentialEchoTargets.values()).filter((time) => {
      return time >= timestamp - MAX_ECHO_DURATION;
    }).length;
  }

  onCast(event: CastEvent) {
    this.numCasts += 1;
    this.percentCovered.push(
      this.lifebind.curNumLifebinds / this.getPotentialTargets(event.timestamp),
    );
    this.potentialEchoTargets.clear();
  }

  get percentWithLifebindOnCast() {
    return (
      this.percentCovered.reduce((prev, cur) => {
        return cur + prev;
      }, 0) / this.percentCovered.length
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.percentWithLifebindOnCast,
      isLessThan: {
        major: 0.4,
        average: 0.5,
        minor: 0.6,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to make sure that you buff as many players as possible with{' '}
          <SpellLink id={TALENTS_EVOKER.LIFEBIND_TALENT} /> prior to casting{' '}
          <SpellLink id={TALENTS_EVOKER.EMERALD_COMMUNION_TALENT} />.
        </>,
      )
        .icon(TALENTS_EVOKER.EMERALD_COMMUNION_TALENT.icon)
        .actual(
          `${formatPercentage(this.percentWithLifebindOnCast, 2)}${t({
            id: 'evoker.preservation.suggestions.emeraldCommunion.numLifebinds',
            message: `% of group with Lifebind when casting Emerald Communion`,
          })}`,
        )
        .recommended(`${recommended * 100}% or more is recommended`),
    );
  }
}

export default EmeraldCommunion;
