import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  ApplyBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

// https://www.warcraftlogs.com/reports/DPNTcb6XkGQZ9xHV#fight=5&type=auras&source=2&ability=340459&view=events log to test with :)

class MaraadsCastRatio extends Analyzer {
  totalCasts = 0;
  maraadsBuffed = false;
  unbuffedCasts = 0;
  expiredBuffs = 0;
  maraadsBuffApplied = 0;
  removals = 0;
  goodRemovals = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.MARAADS_DYING_BREATH.bonusID);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.spell(SPELLS.LIGHT_OF_THE_MARTYR).by(SELECTED_PLAYER),
      this.LOTMcast,
    );
    this.addEventListener(
      Events.applybuff.spell(SPELLS.MARAADS_DYING_BREATH_BUFF).by(SELECTED_PLAYER),
      this.MaraadsBuffAdded,
    );
    this.addEventListener(
      // this fires every time, whether its removed by LOTM, naturally expired, or overwritten by another LOD cast (for some reason)
      Events.removebuff.spell(SPELLS.MARAADS_DYING_BREATH_BUFF).by(SELECTED_PLAYER),
      this.MaraadsBuffRemoved,
    );
    this.addEventListener(
      // this only fires when the Maraads buff is removed by LOTM, not when it naturally expires or is overwritten.
      Events.removebuffstack.spell(SPELLS.MARAADS_DYING_BREATH_BUFF).by(SELECTED_PLAYER),
      this.MaraadsBuffStacksRemoved,
    );
  }

  LOTMcast(event: CastEvent) {
    this.totalCasts += 1;
    if (this.maraadsBuffed === true) {
      this.maraadsBuffed = false;
    } else {
      this.unbuffedCasts += 1;
    }
  }

  MaraadsBuffAdded(event: ApplyBuffEvent) {
    this.maraadsBuffApplied += 1;
    this.maraadsBuffed = true;
  }

  MaraadsBuffRemoved(event: RemoveBuffEvent) {
    this.removals += 1;
  }

  MaraadsBuffStacksRemoved(event: RemoveBuffStackEvent) {
    // if you have the same number of buff removals as buff stack removals, this will be 0, meaning you wasted 0 buffs
    this.goodRemovals += 1;
  }

  get unbuffedLOTMSuggestion() {
    // the actual should be the percentage of LOTM casts that were unbuffed, in decimal form
    return {
      actual: this.unbuffedCasts / this.totalCasts,
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get notEnoughLOTMSuggestion() {
    return {
      actual: (this.removals - this.goodRemovals) / this.maraadsBuffApplied,
      isGreaterThan: {
        minor: 0.1,
        average: 0.175,
        major: 0.25,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
  suggestions(when: When) {
    // (should) only ever display the notEnoughCastsSuggestion or the unbuffedCastsSuggestion, never both
    when(this.unbuffedLOTMSuggestion).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to avoid casting unbuffed <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} />, as it is a
          very inefficient spell when it isn't buffed by{' '}
          <SpellLink id={SPELLS.MARAADS_DYING_BREATH.id} />.
        </>,
      )
        .icon(SPELLS.LIGHT_OF_THE_MARTYR.icon)
        .actual(`${formatPercentage(actual)}% of your casts were unbuffed by Maraad's Dying Breath`)
        .recommended(`< ${formatPercentage(recommended)}% is recommended`),
    );
    when(this.notEnoughLOTMSuggestion).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to avoid overriting the <SpellLink id={SPELLS.MARAADS_DYING_BREATH.id} /> proc, as you
          are wasting a large amount of healing by overwriting the proc. If you are frequently
          unable to find a suitable target for your buffed{' '}
          <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} />, consider using a different legendary.
        </>,
      )
        .icon(SPELLS.LIGHT_OF_THE_MARTYR.icon)
        .actual(`You wasted ${formatPercentage(actual)}% of your Maraad's Dying Breath procs`)
        .recommended(`< ${formatPercentage(recommended)}% is recommended`),
    );
  }
}
export default MaraadsCastRatio;
