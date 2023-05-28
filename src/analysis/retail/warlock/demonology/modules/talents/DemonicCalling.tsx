import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const BUFF_DURATION = 20000;
const debug = false;

class DemonicCalling extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  spellUsable!: SpellUsable;
  wastedProcs = 0;
  _expectedBuffEnd: number | null = null;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DEMONIC_CALLING_TALENT);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CALLING_BUFF),
      this.applyDemonicCallingBuff,
    );
    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CALLING_BUFF),
      this.refreshDemonicCallingBuff,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CALLING_BUFF),
      this.removeDemonicCallingBuff,
    );
  }

  get suggestionThresholds() {
    const wastedPerMinute = (this.wastedProcs / this.owner.fightDuration) * 1000 * 60;
    return {
      actual: wastedPerMinute,
      isGreaterThan: {
        minor: 1,
        average: 1.5,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  applyDemonicCallingBuff(event: ApplyBuffEvent) {
    debug && this.log('DC applied');
    this._expectedBuffEnd = event.timestamp + BUFF_DURATION;
  }

  refreshDemonicCallingBuff(event: RefreshBuffEvent) {
    debug && this.log('DC refreshed');
    if (this.spellUsable.isAvailable(SPELLS.CALL_DREADSTALKERS.id)) {
      this.wastedProcs += 1;
      debug && this.log('Dreadstalkers were available, wasted proc');
    }
    this._expectedBuffEnd = event.timestamp + BUFF_DURATION;
  }

  removeDemonicCallingBuff(event: RemoveBuffEvent) {
    if (this._expectedBuffEnd && event.timestamp >= this._expectedBuffEnd) {
      // the buff fell off, another wasted instant
      this.wastedProcs += 1;
      debug && this.log('DC fell off, wasted proc');
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You should try to use your cheaper <SpellLink id={SPELLS.CALL_DREADSTALKERS.id} /> as much
          as possible as Dreadstalkers make a great portion of your damage.
          <br />
          <br />
          <small>
            NOTE: Some wasted procs are probably unavoidable (e.g.{' '}
            <SpellLink id={SPELLS.CALL_DREADSTALKERS.id} /> on cooldown, proc waiting but gets
            overwritten by another)
          </small>
        </>,
      )
        .icon(TALENTS.DEMONIC_CALLING_TALENT.icon)
        .actual(
          t({
            id: 'warlock.demonology.suggestions.demonicCalling.wastedProcsPerMinute',
            message: `${actual.toFixed(2)} wasted procs per minute`,
          }),
        )
        .recommended(`< ${recommended} is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spellId={TALENTS.DEMONIC_CALLING_TALENT.id}>
          {this.wastedProcs} <small>Wasted procs</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DemonicCalling;
