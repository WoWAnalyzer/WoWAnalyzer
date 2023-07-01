import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';

import Events, { CastEvent } from 'parser/core/Events';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import { Uptime } from 'parser/ui/UptimeBar';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SpellLink } from 'interface';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import HideGoodCastsSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import { logSpellUseEvent } from 'parser/core/SpellUsage/SpellUsageSubSection';

/**
 * Sands of time is an innate ability for Augmentation.
 * Whenever you cast Eruption, Empowers or Breath of Eons, you
 * extend the duration of your Ebon Mights by, 1s, 2s or 5s, respectively.
 * This effect can also crit increases the extended amount by 50%.
 * This modules will simply compare the casts aforementioned spells, and if the
 * casts were outside of your Ebon Might windows, they are considered bad casts.
 *
 */

type PossibleExtends = Uptime & {
  event: CastEvent;
  extended: boolean;
};

class SandsOfTime extends Analyzer {
  private uses: SpellUse[] = [];
  private uptime: PossibleExtends[] = [];

  ebonMightActive: boolean = false;
  ebonMightSpells = [SPELLS.EBON_MIGHT_BUFF_EXTERNAL, SPELLS.EBON_MIGHT_BUFF_PERSONAL];
  trackedSpells = [
    SPELLS.FIRE_BREATH,
    SPELLS.FIRE_BREATH_FONT,
    SPELLS.UPHEAVAL,
    SPELLS.UPHEAVAL_FONT,
    TALENTS.ERUPTION_TALENT,
    TALENTS.BREATH_OF_EONS_TALENT,
  ];
  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(this.ebonMightSpells), () => {
      this.ebonMightActive = true;
    });
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(this.ebonMightSpells), () => {
      this.ebonMightActive = false;
    });
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.trackedSpells), this.onCast);

    this.addEventListener(Events.fightend, this.finalize);
  }

  private onCast(event: CastEvent) {
    const uptime: PossibleExtends = {
      start: event.timestamp,
      end: event.timestamp,
      event: event,
      extended: Boolean(this.ebonMightActive),
    };

    this.uptime.push(uptime);
  }

  private finalize() {
    // finalize uptime
    const uptime = this.uptime.at(-1);
    if (uptime && uptime.end === uptime.start) {
      uptime.end = this.owner.fight.end_time;
    }

    // finalize performances
    this.uses = this.uptime.map(this.sandOfTimeUsage);
  }

  private sandOfTimeUsage(possibleExtends: PossibleExtends): SpellUse {
    const extended = possibleExtends.extended;
    const spell = possibleExtends.event.ability.guid;
    const performance = extended ? QualitativePerformance.Good : QualitativePerformance.Fail;
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
        check: 'consumption',
        timestamp: possibleExtends.start,
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
      <HideGoodCastsSpellUsageSubSection
        title="Sands of Time"
        explanation={explanation}
        uses={this.uses}
        castBreakdownSmallText={<> - Green is a good cast, Red is a bad cast.</>}
        onPerformanceBoxClick={logSpellUseEvent}
        abovePerformanceDetails={<div style={{ marginBottom: 10 }}></div>}
      />
    );
  }
}

export default SandsOfTime;
