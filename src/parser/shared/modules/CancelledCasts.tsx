import { formatMilliseconds, formatNumber, formatPercentage } from 'common/format';
import CrossIcon from 'interface/icons/Cross';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import CASTABLE_WHILE_CASTING_SPELLS from 'parser/core/CASTABLE_WHILE_CASTING_SPELLS';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

import Events, { CastEvent, BeginCastEvent } from '../../core/Events';

const debug = false;
const MS_BUFFER = 100;

class CancelledCasts extends Analyzer {
  castsCancelled = 0;
  castsFinished = 0;
  beginCastSpell: BeginCastEvent | undefined = undefined;
  wasCastStarted: boolean = false;
  cancelledSpellList: {
    [key: number]: {
      spellName: string;
      amount: number;
    };
  } = {};
  IGNORED_ABILITIES: number[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.begincast.by(SELECTED_PLAYER), this.onBeginCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onBeginCast(event: BeginCastEvent) {
    const spellId = event.ability.guid;
    if (
      this.IGNORED_ABILITIES.includes(spellId) ||
      CASTS_THAT_ARENT_CASTS.includes(spellId) ||
      CASTABLE_WHILE_CASTING_SPELLS.includes(spellId)
    ) {
      return;
    }
    if (
      this.wasCastStarted &&
      this.beginCastSpell !== undefined &&
      event.timestamp - this.beginCastSpell.timestamp > MS_BUFFER
    ) {
      this.castsCancelled += 1;
      this.addToCancelledList();
    }
    this.beginCastSpell = event;
    this.wasCastStarted = true;
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    const beginCastAbility = this.beginCastSpell && this.beginCastSpell.ability;
    if (
      this.IGNORED_ABILITIES.includes(spellId) ||
      CASTS_THAT_ARENT_CASTS.includes(spellId) ||
      CASTABLE_WHILE_CASTING_SPELLS.includes(spellId) ||
      !beginCastAbility
    ) {
      return;
    }
    if (beginCastAbility.guid !== spellId && this.wasCastStarted) {
      this.castsCancelled += 1;
      this.addToCancelledList();
    }
    if (beginCastAbility.guid === spellId && this.wasCastStarted) {
      this.castsFinished += 1;
    }
    this.wasCastStarted = false;
  }

  addToCancelledList() {
    if (!this.beginCastSpell) {
      return;
    }
    const beginCastAbility = this.beginCastSpell.ability;
    if (!this.cancelledSpellList[beginCastAbility.guid]) {
      this.cancelledSpellList[beginCastAbility.guid] = {
        spellName: beginCastAbility.name,
        amount: 1,
      };
    } else {
      this.cancelledSpellList[beginCastAbility.guid].amount += 1;
    }
    debug && this.log(beginCastAbility.name + ' cast cancelled');
  }
  get totalCasts() {
    return this.castsCancelled + this.castsFinished;
  }

  get cancelledPercentage() {
    return this.castsCancelled / this.totalCasts;
  }

  get cancelledCastSuggestionThresholds() {
    return {
      actual: this.cancelledPercentage,
      isGreaterThan: {
        minor: 0.02,
        average: 0.05,
        major: 0.15,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get CancelledPerformance(): QualitativePerformance {
    const cancel = this.cancelledPercentage;
    const suggestionThresholds = this.cancelledCastSuggestionThresholds.isGreaterThan;
    if (cancel <= 0.01) {
      return QualitativePerformance.Perfect;
    }
    if (cancel <= suggestionThresholds.minor) {
      return QualitativePerformance.Good;
    }
    if (cancel <= suggestionThresholds.average) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }

  onFightEnd() {
    debug &&
      console.log(
        formatMilliseconds(this.owner.fightDuration),
        'Casts Finished:',
        `${formatNumber(this.castsFinished)}`,
      );
    debug &&
      console.log(
        formatMilliseconds(this.owner.fightDuration),
        'Casts Cancelled:',
        `${formatNumber(this.castsCancelled)}`,
      );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        size="small"
        className="value"
        tooltip={
          <>
            You cast {this.totalCasts} spells.
            <ul>
              <li>{this.castsFinished} casts were completed</li>
              <li>{this.castsCancelled} casts were cancelled</li>
            </ul>
          </>
        }
      >
        <BoringValueText label="Cancelled Casts">
          <CrossIcon /> {formatPercentage(this.cancelledPercentage)}% <small>Casts Cancelled</small>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default CancelledCasts;
