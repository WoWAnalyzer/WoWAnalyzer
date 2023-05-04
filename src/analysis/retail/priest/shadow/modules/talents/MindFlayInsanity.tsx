import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Insanity from 'interface/icons/Insanity';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import UptimeIcon from 'interface/icons/Uptime';

import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';

class MindFlayInsanity extends Analyzer {
  damage = 0;
  insanityGained = 0;
  casts = 0;
  ticks = 0;
  buffs = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SURGE_OF_INSANITY_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.onEnergize,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_BUFF),
      this.onBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_BUFF),
      this.onBuff,
    );
  }

  //regardless of haste, a full channel of this spell ticks 4 times.
  get ticksWastedPercentage() {
    return 1 - this.ticks / (this.casts * 4);
  }
  get ticksWasted() {
    return this.casts * 4 - this.ticks;
  }
  get buffsUnused() {
    return this.buffs - this.casts;
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

  onBuff() {
    this.buffs += 1;
  }

  onCast() {
    this.casts += 1;
  }

  onDamage(event: DamageEvent) {
    this.ticks += 1;
    this.damage += event.amount + (event.absorbed || 0);
  }

  onEnergize(event: ResourceChangeEvent) {
    this.insanityGained += event.resourceChange;
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest) =>
      suggest(
        <>
          You interrupted <SpellLink id={TALENTS.SURGE_OF_INSANITY_TALENT.id} /> early, wasting{' '}
          {formatPercentage(this.ticksWastedPercentage)}% the channel!
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
        <BoringSpellValueText spellId={TALENTS.SURGE_OF_INSANITY_TALENT.id}>
          <>
            <UptimeIcon /> {this.casts} <small>buffs used out of {this.buffs} </small> <br />
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

    /* If needed in the future, these can be used for a GradiatedPerformanceBar that tracks how many time the buff was used or wasted.
    const usedMFI = {
      count: this.casts,
      label: 'Buffs Used',
    };

    const unusedMFI = {
      count: this.buffsUnused,
      label: 'Buffs Unused',
    };
  */
    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS.SURGE_OF_INSANITY_TALENT.id} />
        </b>{' '}
        is gained every time you cast <SpellLink id={TALENTS.DEVOURING_PLAGUE_TALENT.id} />.<br />
        This proc is low priority. If you have higher priority spells available, cast them instead,
        even if it causes this proc to be overwritten or unused. When you do use this spell, it
        should be fully channeled.
      </p>
    );

    const data = (
      <div>
        <strong>Mind Flay Insanity Channels</strong>
        <GradiatedPerformanceBar good={goodMFI} bad={badMFI} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default MindFlayInsanity;
