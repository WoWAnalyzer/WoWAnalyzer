import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

const BUFF_DURATION = 20000;

class VanquishersHammerAnalysis extends Analyzer {
  totalBuffs = 0;
  goodRemovals = 0;

  buffsPerCast = 1;
  currentBuffs = 0;
  applicationStamp = -1;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NECROLORD.id);
    if (!this.active) {
      return;
    }

    if (this.selectedCombatant.hasLegendary(SPELLS.DUTY_BOUND_GAVEL)) {
      this.buffsPerCast = 2;
    }

    this.addEventListener(
      Events.applybuff.spell(SPELLS.VANQUISHERS_HAMMER).by(SELECTED_PLAYER),
      this.applyBuff,
    );

    this.addEventListener(
      Events.refreshbuff.spell(SPELLS.VANQUISHERS_HAMMER).by(SELECTED_PLAYER),
      this.refreshBuff,
    );

    this.addEventListener(
      Events.removebuff.spell(SPELLS.VANQUISHERS_HAMMER).by(SELECTED_PLAYER),
      this.removeBuff,
    );

    this.addEventListener(
      Events.removebuffstack.spell(SPELLS.VANQUISHERS_HAMMER).by(SELECTED_PLAYER),
      this.removeBuffStack,
    );
  }

  applyBuff(event: ApplyBuffEvent) {
    this.currentBuffs = this.buffsPerCast;
    this.totalBuffs += this.buffsPerCast;
    this.applicationStamp = event.timestamp;
  }

  refreshBuff(event: RefreshBuffEvent) {
    this.totalBuffs += 1;
    this.applicationStamp = event.timestamp;
  }

  removeBuff(event: RemoveBuffEvent) {
    this.currentBuffs = 0;
    if (this.applicationStamp === -1) {
      return;
    }

    if (this.applicationStamp + BUFF_DURATION <= event.timestamp * 0.99) {
      return;
    }

    this.goodRemovals += 1;
  }

  removeBuffStack(event: RemoveBuffStackEvent) {
    this.currentBuffs = event.stack;
    if (this.applicationStamp === -1) {
      return;
    }

    if (this.applicationStamp + BUFF_DURATION <= event.timestamp * 0.99) {
      return;
    }

    this.goodRemovals += 1;
  }

  get missedChargesSuggestion() {
    return {
      actual: this.totalBuffs - this.goodRemovals,
      isGreaterThan: {
        minor: 1,
        average: 2,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.missedChargesSuggestion).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to avoid wasting the <SpellLink id={SPELLS.VANQUISHERS_HAMMER.id} /> buff, as this is
          a large waste of healing.
        </>,
      )
        .icon(SPELLS.VANQUISHERS_HAMMER.icon)
        .actual(<>You wasted {actual} buffs</>)
        .recommended(`It is recommended to never waste the buff.`),
    );
  }
}
export default VanquishersHammerAnalysis;
