import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const debug = false;

const BUFF_DURATION = 10000;
// haven't yet found out if it's exactly 10 second delay between application and removal of the buff (or is it few ms earlier), might need to tweak with that to be accurate
const REMOVEBUFF_TOLERANCE = 20;

class Backdraft extends Analyzer {
  get suggestionThresholds(): NumberThreshold {
    const wastedStacksPerMinute = (this.wastedStacks / this.owner.fightDuration) * 1000 * 60;
    return {
      actual: wastedStacksPerMinute,
      isGreaterThan: {
        minor: 1,
        average: 1.5,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  _maxStacks = 2;
  _stacksPerApplication = 1;
  _currentStacks = 0;
  _expectedBuffEnd = 0;
  wastedStacks = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CONFLAGRATE),
      this.onConflagrateCast,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.BACKDRAFT),
      this.onBackdraftRemoveStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BACKDRAFT),
      this.onBackdraftRemove,
    );
  }

  onConflagrateCast(event: CastEvent) {
    this._currentStacks += this._stacksPerApplication;
    if (this._currentStacks > this._maxStacks) {
      debug && console.log('backdraft stack waste at ', event.timestamp);
      this.wastedStacks += this._currentStacks - this._maxStacks;
      this._currentStacks = this._maxStacks;
    }
    this._expectedBuffEnd = event.timestamp + BUFF_DURATION;
  }

  onBackdraftRemoveStack() {
    this._currentStacks -= 1;
  }

  onBackdraftRemove(event: RemoveBuffEvent) {
    if (event.timestamp >= this._expectedBuffEnd - REMOVEBUFF_TOLERANCE) {
      // if the buff expired when it "should", we wasted some stacks
      debug && console.log('backdraft stack waste at ', event.timestamp);
      this.wastedStacks += this._currentStacks;
    }
    this._currentStacks = 0;
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You should use your <SpellLink id={SPELLS.BACKDRAFT.id} /> stacks more. You have wasted{' '}
          {this.wastedStacks} stacks this fight.
        </>,
      )
        .icon(SPELLS.BACKDRAFT.icon)
        .actual(
          t({
            id: 'warlock.destruction.suggestions.backdraft.wastedPerMinute',
            message: `${actual.toFixed(2)} wasted Backdraft stacks per minute`,
          }),
        )
        .recommended(`< ${recommended} is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic size="small" category={STATISTIC_CATEGORY.TALENTS}>
        <BoringSpellValueText spellId={SPELLS.BACKDRAFT.id}>
          {this.wastedStacks} <small>Wasted procs</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Backdraft;
