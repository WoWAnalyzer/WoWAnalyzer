import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS/classic/warlock';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';

class MoltenCore extends Analyzer {
  procsGained: number = 0; // Total gained procs (including refreshed)
  procsExpired: number = 0; // Procs lost to time
  procsOver: number = 0; // Procs lost to overwriting them

  lastProcTime: number = 0;
  lastCastTime: number = 0;
  currentStacks: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.INCINERATE), this.onCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SOUL_FIRE), this.onCast);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MOLTEN_CORE_BUFF),
      this.onBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.MOLTEN_CORE_BUFF),
      this.onRemove,
    );
  }
  get procsWasted() {
    return this.procsExpired + this.procsOver;
  }

  get procsUsed() {
    return this.procsGained - this.procsExpired - this.procsOver;
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

  onCast(event: CastEvent) {
    if (this.currentStacks) {
      this.currentStacks -= 1;
    }
  }

  onBuff(event: ApplyBuffEvent) {
    if (this.currentStacks) {
      this.procsOver += this.currentStacks;
    }
    this.currentStacks = 3;
    this.procsGained += 3;
  }

  onRemove(event: RemoveBuffEvent) {
    if (this.currentStacks) {
      this.procsExpired += this.currentStacks;
    }
    this.currentStacks = 0;
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest) =>
      suggest(
        <>
          You lost {this.procsWasted} casts of <SpellLink spell={SPELLS.INCINERATE} />
        </>,
      )
        .icon(SPELLS.MOLTEN_CORE_BUFF.icon)
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
      <Statistic category={STATISTIC_CATEGORY.GENERAL} size="flexible">
        <BoringSpellValueText spell={SPELLS.MOLTEN_CORE_BUFF}>
          <>
            {this.procsUsed}/{this.procsGained} <small>Procs Used</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const usedMC = {
      count: this.procsUsed,
      label: 'Buffs Used',
    };

    const overMC = {
      count: this.procsOver,
      label: 'Buffs Overwritten',
    };

    const expiredMC = {
      count: this.procsExpired,
      label: 'Buffs Expired',
    };

    const explanation = (
      <>
        <b>
          <SpellLink spell={SPELLS.MOLTEN_CORE_BUFF} />
        </b>{' '}
        is gained randomly from <SpellLink spell={SPELLS.CORRUPTION} /> damage. <br />
        Cast <SpellLink spell={SPELLS.INCINERATE} /> or <SpellLink spell={SPELLS.SOUL_FIRE} /> while
        the buff is active to avoid wasting procs.
      </>
    );
    const data = (
      <div>
        <strong>Molten Core Procs</strong>
        <GradiatedPerformanceBar good={usedMC} ok={overMC} bad={expiredMC} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default MoltenCore;
