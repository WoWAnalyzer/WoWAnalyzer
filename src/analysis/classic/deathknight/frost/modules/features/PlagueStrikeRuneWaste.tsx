import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

// WCL classResources type ID for Unholy rune
const UNHOLY_RUNE_TYPE = 22;

/**
 * Tracks Plague Strike casts that consumed a Death rune instead of a natural
 * Unholy rune. PS costs 1U; spending a Death rune on it wastes a scarce
 * resource that should be reserved for higher-value abilities.
 *
 * Detection: if classResources lacks a type=22 (Unholy) entry with cost>0,
 * a Death rune filled that slot.
 *
 * Matches Python PlagueStrikeRuneAnalyzer.
 */
class PlagueStrikeRuneWaste extends Analyzer {
  private _total = 0;
  private _bad = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PLAGUE_STRIKE), this.onCast);
  }

  private onCast(event: CastEvent) {
    this._total += 1;
    if (!event.classResources) {
      return;
    }
    let hadUnholy = false;
    for (const res of event.classResources) {
      if (res.cost > 0 && res.type === UNHOLY_RUNE_TYPE) {
        hadUnholy = true;
        break;
      }
    }
    if (!hadUnholy) {
      this._bad += 1;
    }
  }

  get suggestionThresholds() {
    return {
      actual: this._bad,
      isGreaterThan: { minor: 0, average: 2, major: 5 },
      style: ThresholdStyle.NUMBER,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(46)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={`${this._total - this._bad} of ${this._total} Plague Strikes used a natural Unholy rune (${this._bad} used a Death rune instead).`}
      >
        <BoringSpellValueText spell={SPELLS.PLAGUE_STRIKE}>
          {this._total - this._bad} <small>/ {this._total} used natural Unholy rune</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PlagueStrikeRuneWaste;
