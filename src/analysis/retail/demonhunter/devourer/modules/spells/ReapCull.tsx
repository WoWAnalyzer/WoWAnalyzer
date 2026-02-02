import type { JSX } from 'react';
import SPELLS from 'common/SPELLS/demonhunter';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import Events from 'parser/core/Events';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class ReapCull extends Analyzer {
  cullCasts = 0;
  cullEntries: BoxRowEntry[] = [];

  reapCasts = 0;
  reapEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CULL), this.onCullCast);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REAP), this.onReapCast);
  }

  onReapCast() {
    const value = QualitativePerformance.Good;

    const tooltip = <>oui</>;
    this.reapEntries.push({ value, tooltip });
  }

  onCullCast() {
    const value = QualitativePerformance.Good;

    const tooltip = <>oui</>;

    this.cullEntries.push({ value, tooltip });
  }

  guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          Outside <SpellLink spell={TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT} />, you have
          access to <SpellLink spell={SPELLS.REAP} />, which is only to be used to quickly absorb
          the last few souls you need to get into{' '}
          <SpellLink spell={TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT} />.
        </p>
        <p>
          During <SpellLink spell={TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT} />, it's a very
          different story. <SpellLink spell={SPELLS.REAP} /> is upgraded to{' '}
          <SpellLink spell={SPELLS.CULL} /> and should be cast as much as possible.
          <br />
          Aim to cast it with 4+ souls:
          <ol>
            <li>
              After every 2nd <SpellLink spell={SPELLS.DEVOUR} />
            </li>
            <li>
              After every <SpellLink spell={TALENTS_DEMON_HUNTER.VOID_RAY_TALENT} />
            </li>
          </ol>
        </p>
      </>
    );
    const data = (
      <RoundedPanel>
        <CastSummaryAndBreakdown spell={SPELLS.REAP} castEntries={this.reapEntries} />
        <CastSummaryAndBreakdown spell={SPELLS.CULL} castEntries={this.cullEntries} />
      </RoundedPanel>
    );
    return (
      <ExplanationAndDataSubSection
        explanation={explanation}
        data={data}
        explanationPercent={GUIDE_CORE_EXPLANATION_PERCENT}
        title="Reap and Cull"
      />
    );
  }
}

export default ReapCull;
