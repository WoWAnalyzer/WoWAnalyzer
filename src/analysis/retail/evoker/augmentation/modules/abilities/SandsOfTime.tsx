import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';

import Events, { CastEvent, EmpowerEndEvent } from 'parser/core/Events';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SpellLink } from 'interface';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import ContextualSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import { failedEbonMightExtension } from '../normalizers/CastLinkNormalizer';
import '../Styling.scss';
import { BREATH_OF_EONS_SPELLS } from '../../constants';

/**
 * Sands of time is an innate ability for Augmentation.
 * Whenever you cast Eruption, Empowers or Breath of Eons, you
 * extend the duration of your Ebon Mights by, 1s, 2s or 5s, respectively.
 * This effect can also crit increases the extended amount by 50%.
 * This modules will simply compare the casts aforementioned spells, and if the
 * casts were outside of your Ebon Might windows, they are considered bad casts.
 */

interface PossibleExtends {
  event: CastEvent | EmpowerEndEvent;
  extended: boolean;
}

class SandsOfTime extends Analyzer {
  private uses: SpellUse[] = [];
  private extendAttempts: PossibleExtends[] = [];

  ebonMightActive: boolean = false;
  trackedSpells = [
    TALENTS.ERUPTION_TALENT,
    ...BREATH_OF_EONS_SPELLS,
    SPELLS.BREATH_OF_EONS_SCALECOMMANDER,
  ];
  empowers = [SPELLS.FIRE_BREATH, SPELLS.FIRE_BREATH_FONT, SPELLS.UPHEAVAL, SPELLS.UPHEAVAL_FONT];
  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.EBON_MIGHT_BUFF_PERSONAL),
      () => {
        this.ebonMightActive = true;
      },
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.EBON_MIGHT_BUFF_PERSONAL),
      () => {
        this.ebonMightActive = false;
      },
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.trackedSpells), this.onCast);
    this.addEventListener(Events.empowerEnd.by(SELECTED_PLAYER).spell(this.empowers), this.onCast);

    this.addEventListener(Events.fightend, this.finalize);
  }

  private onCast(event: CastEvent | EmpowerEndEvent) {
    const extendAttempts: PossibleExtends = {
      event: event,
      extended: Boolean(this.ebonMightActive),
    };

    this.extendAttempts.push(extendAttempts);
  }

  private finalize() {
    // finalize performances
    this.uses = this.extendAttempts.map(this.sandOfTimeUsage);
  }

  private sandOfTimeUsage(possibleExtends: PossibleExtends): SpellUse {
    let extended = possibleExtends.extended;
    if (failedEbonMightExtension(possibleExtends.event)) {
      extended = false;
    }
    const spell = possibleExtends.event.ability.guid;
    let performance = extended ? QualitativePerformance.Good : QualitativePerformance.Fail;
    if (spell === TALENTS.ERUPTION_TALENT.id && !extended) {
      performance = QualitativePerformance.Fail;
    }
    const summary = (
      <div>
        Extended with <SpellLink spell={spell} />
      </div>
    );
    const details = extended ? (
      <div>
        You extended your <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> buff by casting{' '}
        <SpellLink spell={spell} />. Good job!
      </div>
    ) : (
      <div>
        <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> wasn't active. You should always try and
        cast <SpellLink spell={spell} /> inside of your{' '}
        <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> window.
      </div>
    );

    const checklistItems: ChecklistUsageInfo[] = [
      {
        check: 'possible-extends',
        timestamp: possibleExtends.event.timestamp,
        performance,
        summary,
        details,
      },
    ];
    const actualPerformance = combineQualitativePerformances(
      checklistItems.map((item) => item.performance),
    );

    return {
      event: possibleExtends.event,
      performance: actualPerformance,
      checklistItems,
      performanceExplanation:
        actualPerformance !== QualitativePerformance.Fail
          ? `${actualPerformance} Usage`
          : 'Bad Usage',
    };
  }

  guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }

    const explanation = (
      <section>
        <strong>
          <SpellLink spell={SPELLS.SANDS_OF_TIME} />
        </strong>{' '}
        extends the duration of your <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> when casting{' '}
        <SpellLink spell={SPELLS.FIRE_BREATH} />, <SpellLink spell={SPELLS.UPHEAVAL} />,{' '}
        <SpellLink spell={TALENTS.ERUPTION_TALENT} /> or{' '}
        <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} />. You should never cast these spells
        outside your <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> windows.
      </section>
    );

    return (
      <ContextualSpellUsageSubSection
        title="Sands of Time"
        explanation={explanation}
        uses={this.uses}
        castBreakdownSmallText={
          <>
            {' '}
            - <span className="goodCast">Green</span> is a good cast where you extended you{' '}
            <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> window,{' '}
            <span className="badCast">red</span> is a bad cast where you didn't extend.
          </>
        }
        abovePerformanceDetails={<div style={{ marginBottom: 10 }}></div>}
      />
    );
  }
}

export default SandsOfTime;
