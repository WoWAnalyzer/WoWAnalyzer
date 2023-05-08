import { t } from '@lingui/macro';
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

  procsGained: number = 0; //Total gained Procs(including refreshed) (Should be equal to number of cast DP)
  procsExpired: number = 0; //procs lost to time
  procsOver: number = 0; //procs lost to overwriting them

  lastProcTime: number = 0;
  currentStacks: number = 0;

  //TODO: Test if these spells (_DAMAGE and _BUFF) are still the correct ids.

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.SURGE_OF_INSANITY_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS.MIND_SPIKE_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_SPIKE_INSANITY_TALENT_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.MIND_SPIKE_INSANITY_TALENT_DAMAGE),
      this.onEnergize,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MIND_SPIKE_INSANITY_TALENT_DAMAGE),
      this.onCast,
    );
    //Buff
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MIND_SPIKE_INSANITY_TALENT_BUFF),
      this.onBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.MIND_SPIKE_INSANITY_TALENT_BUFF),
      this.onBuffStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.MIND_SPIKE_INSANITY_TALENT_BUFF),
      this.onRemove,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.MIND_SPIKE_INSANITY_TALENT_BUFF),
      this.onRemoveStack,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.MIND_SPIKE_INSANITY_TALENT_BUFF),
      this.onRefresh,
    );
  }
  get procsWasted() {
    return this.procsExpired + this.procsOver;
  }

  get suggestionThresholds() {
    return {
      actual: this.procsWasted,
      isGreaterThan: {
        minor: 0.0,
        average: 0.5,
        major: 1.1,
      },
      style: ThresholdStyle.NUMBER,
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
    this.damage += event.amount + (event.absorbed || 0);
  }

  onEnergize(event: ResourceChangeEvent) {
    //TODO: Reduce this by what an unimpowered spell would give?
    this.insanityGained += event.resourceChange;
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest) =>
      suggest(
        <>
          You lost {this.procsWasted} casts of{' '}
          <SpellLink id={SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE.id} />
        </>,
      )
        .icon(TALENTS.SURGE_OF_INSANITY_TALENT.icon)
        .actual(
          t({
            id: 'priest.shadow.suggestions.mindSpikeInsanity.castLost',
            message: `Lost ${this.procsWasted} casts of Mind Spike: Insanity.`,
          }),
        )
        .recommended('No lost casts is recommended.'),
    );
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spellId={SPELLS.MIND_SPIKE_INSANITY_TALENT_BUFF.id}>
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
    const usedMSI = {
      count: this.casts,
      label: 'Buffs Used',
    };

    const overMSI = {
      count: this.procsOver,
      label: 'Buffs Overwritten',
    };

    const expiredMSI = {
      count: this.procsExpired,
      label: 'Buffs Expired',
    };

    const explanation = (
      <p>
        <b>
          <SpellLink id={SPELLS.MIND_SPIKE_INSANITY_TALENT_BUFF.id} />
        </b>{' '}
        is gained every time you cast <SpellLink id={TALENTS.DEVOURING_PLAGUE_TALENT.id} />.<br />
        This buff can stack two times. While you have two stacks, try cast{' '}
        <SpellLink id={SPELLS.MIND_SPIKE_INSANITY_TALENT_DAMAGE} /> before casting{' '}
        <SpellLink id={TALENTS.DEVOURING_PLAGUE_TALENT.id} />, unless you will otherwise overcap on
        Insanity
      </p>
    );
    const data = (
      <div>
        <strong>Mind Spike Insanity Procs</strong>
        <GradiatedPerformanceBar good={usedMSI} ok={overMSI} bad={expiredMSI} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default MindFlayInsanity;
