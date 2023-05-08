import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Insanity from 'interface/icons/Insanity';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  DamageEvent,
  ResourceChangeEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import UptimeIcon from 'interface/icons/Uptime';

import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';

const BUFF_DURATION_MS = 15000;

class MindFlayInsanity extends Analyzer {
  damage = 0;
  insanityGained = 0;
  casts = 0;
  ticks = 0;

  procsGained: number = 0; //Total gained Procs(including refreshed) (Should be equal to number of cast DP)
  procsExpired: number = 0; //procs lost to time
  procsOver: number = 0; //procs lost to overwriting them

  lastProcTime: number = 0;
  currentStacks: number = 0;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.SURGE_OF_INSANITY_TALENT) &&
      !this.selectedCombatant.hasTalent(TALENTS.MIND_SPIKE_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.onEnergize,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.onCast,
    );
    //Buff
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_BUFF),
      this.onBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_BUFF),
      this.onBuffStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_BUFF),
      this.onRemove,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_BUFF),
      this.onRemoveStack,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_BUFF),
      this.onRefresh,
    );
  }

  //regardless of haste, a full channel of this spell ticks 4 times.
  get ticksWastedPercentage() {
    return 1 - this.ticks / (this.casts * 4);
  }
  get ticksWasted() {
    return this.casts * 4 - this.ticks;
  }
  get procsWasted() {
    return this.procsExpired + this.procsOver;
  }

  get suggestionThresholds() {
    return {
      actual: this.ticksWastedPercentage,
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  //Based on Frost DK Killing Machine.
  onBuff(event: ApplyBuffEvent) {
    this.procsGained += 1;
    this.lastProcTime = event.timestamp;
  }
  onBuffStack(event: ApplyBuffStackEvent) {
    this.procsGained += 1;
    this.lastProcTime = event.timestamp;
    this.currentStacks = event.stack;
  }

  onRemove(event: RemoveBuffEvent) {
    const durationHeld = event.timestamp - this.lastProcTime;
    if (durationHeld > BUFF_DURATION_MS - 20) {
      this.procsExpired += 1;
    }
  }

  onRemoveStack(event: RemoveBuffStackEvent) {
    this.currentStacks = event.stack;
  }

  onRefresh() {
    this.procsGained += 1;
    if (this.currentStacks === 2) {
      this.procsOver += 1;
    }
  }

  onCast() {
    this.casts += 1;
  }

  onDamage(event: DamageEvent) {
    this.ticks += 1;
    this.damage += event.amount + (event.absorbed || 0);
  }

  onEnergize(event: ResourceChangeEvent) {
    //TODO: Reduce this by what an unimpowered spell would give?
    this.insanityGained += event.resourceChange;
  }

  suggestions(when: When) {
    //TODO:Add second Suggestion for proc usage
    when(this.suggestionThresholds).addSuggestion((suggest) =>
      suggest(
        <>
          You interrupted <SpellLink id={SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE.id} /> early,
          wasting {formatPercentage(this.ticksWastedPercentage)}% the channel!
        </>,
      )
        .icon(TALENTS.SURGE_OF_INSANITY_TALENT.icon)
        .actual(
          t({
            id: 'priest.shadow.suggestions.mindFlayInsanity.ticksLost',
            message: `Lost ${this.ticksWasted} ticks of Mind Flay: Insanity.`,
          }),
        )
        .recommended('No ticks lost is recommended.'),
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {this.ticksWasted} ticks wasted by cancelling the channel early. <br />
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.MIND_FLAY_INSANITY_TALENT_BUFF.id}>
          <>
            <UptimeIcon /> {this.casts} <small>buffs used out of {this.procsGained} </small> <br />
            <ItemDamageDone amount={this.damage} /> <br />
            <Insanity /> {this.insanityGained} <small>Insanity generated</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const goodMFI = {
      count: this.ticks,
      label: 'Used Ticks',
    };

    const badMFI = {
      count: this.ticksWasted,
      label: 'Canceled Ticks',
    };

    const usedMFI = {
      count: this.casts,
      label: 'Buffs Used',
    };

    const overMFI = {
      count: this.procsOver,
      label: 'Buffs Overwritten',
    };

    const expiredMFI = {
      count: this.procsExpired,
      label: 'Buffs Expired',
    };

    const explanation = (
      <p>
        <b>
          <SpellLink id={SPELLS.MIND_FLAY_INSANITY_TALENT_BUFF.id} />
        </b>{' '}
        is gained every time you cast <SpellLink id={TALENTS.DEVOURING_PLAGUE_TALENT.id} />.<br />
        This buff can stack two times. While you have two stacks, try cast{' '}
        <SpellLink id={SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE} /> before casting{' '}
        <SpellLink id={TALENTS.DEVOURING_PLAGUE_TALENT.id} />, unless you will otherwise overcap on
        Insanity
      </p>
    );
    const data = (
      <div>
        <strong>Mind Flay Insanity Channels</strong>
        <GradiatedPerformanceBar good={goodMFI} bad={badMFI} />
        <strong>Mind Flay Insanity Procs</strong>
        <GradiatedPerformanceBar good={usedMFI} ok={overMFI} bad={expiredMFI} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default MindFlayInsanity;
