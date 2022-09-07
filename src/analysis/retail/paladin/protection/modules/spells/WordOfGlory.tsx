import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent, ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { When, ThresholdStyle } from 'parser/core/ParseResults';

const OVERHEAL_THRESHOLD = 0.75;

export default class WordOfGlory extends Analyzer {
  private slCount = 0;
  private slWasted = 0;
  // sotr casts w/ SL up.
  private slSotrs = 0;

  private castsFree = 0;
  private castsPayed = 0;
  // casts that overhealed by enough to be concerning
  private castsOverhealed = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.cast.spell(SPELLS.WORD_OF_GLORY).by(SELECTED_PLAYER), this.cast);
    this.addEventListener(
      Events.cast.spell(SPELLS.SHIELD_OF_THE_RIGHTEOUS).by(SELECTED_PLAYER),
      this.sotrCast,
    );
    this.addEventListener(Events.applybuff.spell(SPELLS.SHINING_LIGHT), this.slApply);
    this.addEventListener(Events.removebuff.spell(SPELLS.SHINING_LIGHT), this.slRemove);
    this.addEventListener(Events.heal.spell(SPELLS.WORD_OF_GLORY).by(SELECTED_PLAYER), this.heal);
  }

  private heal(event: HealEvent) {
    const totalHeal = event.amount + (event.overheal || 0) + (event.absorbed || 0);

    if (event.hitType !== HIT_TYPES.CRIT && event.amount / totalHeal < OVERHEAL_THRESHOLD) {
      this.castsOverhealed += 1;
    }
  }

  private cast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.SHINING_LIGHT.id)) {
      this.castsFree += 1;
      this.slWasted -= 1;
    } else {
      this.castsPayed += 1;
    }
  }

  private sotrCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.SHINING_LIGHT.id)) {
      this.slSotrs += 1;
    }
  }

  private slApply(_event: ApplyBuffEvent) {
    this.slCount += 1;
  }

  private slRemove(_event: RemoveBuffEvent) {
    // always mark wasted. when a cast is free, we subtract one. the end result
    // is that if you use every SL you net 0 wasted.
    this.slWasted += 1;
  }

  get totalCasts() {
    return this.castsFree + this.castsPayed;
  }

  get overhealSuggestion() {
    return {
      actual: this.castsOverhealed / this.totalCasts,
      isGreaterThan: {
        minor: 0.1,
        average: 0.15,
        major: 0.2,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get wastedSlSuggestion() {
    return {
      actual: this.slWasted,
      isGreaterThan: {
        minor: 1,
        average: 3,
        major: 4,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.overhealSuggestion).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to avoid casting <SpellLink id={SPELLS.WORD_OF_GLORY.id} /> when a large portion of it
          would overheal.
        </>,
      )
        .icon(SPELLS.WORD_OF_GLORY.icon)
        .actual(`${formatPercentage(actual)}% of your casts overhealed by more than 25%`)
        .recommended(`< ${formatPercentage(recommended)}% is recommended`),
    );

    when(this.wastedSlSuggestion).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Make sure to use all of the free <SpellLink id={SPELLS.WORD_OF_GLORY.id} /> casts granted
          by <SpellLink id={SPELLS.SHINING_LIGHT.id} />.
        </>,
      )
        .icon(SPELLS.SHINING_LIGHT.icon)
        .actual(`You let ${actual} free casts expire.`)
        .recommended(`< ${recommended}% is recommended`),
    );
  }
}
