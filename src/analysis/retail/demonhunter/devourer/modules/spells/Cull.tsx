import type { JSX } from 'react';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { SpellLink } from 'interface';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';

class Cull extends Analyzer {
  cullEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CULL), this.onCullCast);
  }

  onCullCast(cast: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.VOID_METAMORPHOSIS_BUFF)) {
      return;
    }

    const soulFragments = this.selectedCombatant.getBuffStacks(SPELLS.SOUL_FRAGMENT_DEVOUR);

    let value = QualitativePerformance.Good;
    let tooltip = (
      <>
        Nice! <SpellLink spell={SPELLS.CULL} /> was cast with {soulFragments} soul fragment(s).
      </>
    );

    if (soulFragments >= 4) {
      value = QualitativePerformance.Perfect;
      tooltip = (
        <>
          Great! You used <SpellLink spell={SPELLS.CULL} /> with a strong soul fragment pool.
        </>
      );
    } else if (soulFragments === 3) {
      value = QualitativePerformance.Ok;
      tooltip = (
        <>
          You cast <SpellLink spell={SPELLS.CULL} /> with 3 soul fragments. Aim for 4+ if possible.
        </>
      );
    } else {
      value = QualitativePerformance.Fail;
      tooltip = (
        <>
          You cast <SpellLink spell={SPELLS.CULL} /> with only {soulFragments} soul fragment(s). Try
          to wait for more fragments to maximize this cooldown window.
        </>
      );
      addInefficientCastReason(
        cast,
        `Cull was cast with only ${soulFragments} soul fragment(s) during Void Metamorphosis.`,
      );
    }

    this.cullEntries.push({ value, tooltip });
  }

  guideSubsection(): JSX.Element {
    return (
      <ExplanationAndDataSubSection
        explanation={
          <>
            <p>
              <SpellLink spell={SPELLS.CULL} /> should be used as often as possible during{' '}
              <SpellLink spell={SPELLS.VOID_METAMORPHOSIS_BUFF} />. Aim to cast it with 4 or more{' '}
              <SpellLink spell={SPELLS.SOUL_FRAGMENT_DEVOUR} /> to get the most value from the
              window.
            </p>
          </>
        }
        data={
          <RoundedPanel>
            <CastSummaryAndBreakdown spell={SPELLS.CULL} castEntries={this.cullEntries} />
          </RoundedPanel>
        }
        explanationPercent={GUIDE_CORE_EXPLANATION_PERCENT}
        title="Cull"
      />
    );
  }
}

export default Cull;
