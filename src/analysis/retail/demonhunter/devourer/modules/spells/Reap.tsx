import type { JSX } from 'react';
import SPELLS from 'common/SPELLS/demonhunter';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import Events, { CastEvent } from 'parser/core/Events';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import {
  MOMENT_OF_CRAVING_ADDITIONAL_SOUL_ABSORB_CAPACITY,
  REAP_CULL_MAX_SOUL_ABSORB_CAPACITY,
  VOID_METAMORPHOSIS_BASE_SOULS_COST,
  VOID_METAMORPHOSIS_SOUL_GLUTTON_SOULS_COST,
} from '../../constants';

class Reap extends Analyzer {
  reapEntries: BoxRowEntry[] = [];

  hasSoulGluttonTalent = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.SOUL_GLUTTON_TALENT);

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REAP), this.onReapCast);
  }

  onReapCast(event: CastEvent) {
    const soulsRequiredVoidMeta = this.hasSoulGluttonTalent
      ? VOID_METAMORPHOSIS_SOUL_GLUTTON_SOULS_COST
      : VOID_METAMORPHOSIS_BASE_SOULS_COST;
    const availableSouls = this.selectedCombatant.getBuffStacks(SPELLS.SOUL_FRAGMENT_DEVOUR);
    const hasMomentOfCravingBuff = this.selectedCombatant.hasBuff(SPELLS.MOMENT_OF_CRAVING_BUFF);
    const soulsPreCast = this.selectedCombatant.getBuffStacks(SPELLS.VOID_METAMORPHOSIS_SOULS);

    const soulsPostCast =
      soulsPreCast +
      Math.min(
        availableSouls,
        hasMomentOfCravingBuff
          ? REAP_CULL_MAX_SOUL_ABSORB_CAPACITY + MOMENT_OF_CRAVING_ADDITIONAL_SOUL_ABSORB_CAPACITY
          : REAP_CULL_MAX_SOUL_ABSORB_CAPACITY,
      );

    let value = QualitativePerformance.Good;
    let tooltip = (
      <>
        Great! This cast gave you enough souls to access{' '}
        <SpellLink spell={TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT} />.
      </>
    );

    if (soulsPreCast === soulsRequiredVoidMeta) {
      value = QualitativePerformance.Fail;
      tooltip = (
        <>
          You already had enough souls to enter{' '}
          <SpellLink spell={TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT} />!
        </>
      );
    } else if (
      soulsPostCast >= soulsRequiredVoidMeta - 4 &&
      soulsPostCast < soulsRequiredVoidMeta
    ) {
      value = QualitativePerformance.Ok;
      tooltip = (
        <>
          You cast <SpellLink spell={SPELLS.REAP} /> a tad too early. ({soulsPostCast} souls after
          cast)
        </>
      );
    } else if (soulsPostCast < soulsRequiredVoidMeta) {
      value = QualitativePerformance.Fail;
      tooltip = (
        <>
          You cast <SpellLink spell={SPELLS.REAP} /> too early! ({soulsPostCast} souls after cast)
        </>
      );
    }

    this.reapEntries.push({ value, tooltip });
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
      </>
    );
    const data = (
      <RoundedPanel>
        <CastSummaryAndBreakdown spell={SPELLS.REAP} castEntries={this.reapEntries} />
      </RoundedPanel>
    );
    return (
      <ExplanationAndDataSubSection
        explanation={explanation}
        data={data}
        explanationPercent={GUIDE_CORE_EXPLANATION_PERCENT}
        title="Reap"
      />
    );
  }
}

export default Reap;
