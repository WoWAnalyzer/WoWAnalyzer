import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { SpellLink, TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
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
  _buffedChaosBoltCasts = 0;
  _buffedIncinerateCasts = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CONFLAGRATE),
      this.onConflagrateCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.INCINERATE),
      this.onIncinerateCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CHAOS_BOLT),
      this.onChaosBoltCast,
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

  onIncinerateCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.BACKDRAFT.id)) {
      this._buffedIncinerateCasts += 1;
    }
  }

  onChaosBoltCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.BACKDRAFT.id)) {
      this._buffedChaosBoltCasts += 1;
    }
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

  get buffedChaosBoltCasts() {
    return this._buffedChaosBoltCasts;
  }
  get buffedIncinerateCasts() {
    return this._buffedIncinerateCasts;
  }
  get totalBuffedCasts() {
    return this.buffedChaosBoltCasts + this.buffedIncinerateCasts;
  }
  get percentageOfChaosBoltsAmongBuffedCasts() {
    return this.buffedChaosBoltCasts / this.totalBuffedCasts;
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
      <Statistic category={STATISTIC_CATEGORY.TALENTS}>
        <TalentSpellText talent={TALENTS.BACKDRAFT_TALENT}>
          {this.wastedStacks} <small>Wasted procs</small>
          <br />
          {formatPercentage(this.percentageOfChaosBoltsAmongBuffedCasts, 0)}%
          <TooltipElement content={`${this.buffedChaosBoltCasts}/${this.totalBuffedCasts}`}>
            <small> buffed casts - Chaos Bolt</small>
          </TooltipElement>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Backdraft;
