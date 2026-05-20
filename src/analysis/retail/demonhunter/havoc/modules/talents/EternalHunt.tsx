import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS/demonhunter';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { JSX } from 'react';
import SpellLink from 'interface/SpellLink';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  RemoveBuffEvent,
  FightEndEvent,
} from 'parser/core/Events';
import { ChecklistUsageInfo, SpellUse, UsageInfo } from 'parser/core/SpellUsage/core';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import ContextualSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import { logSpellUseEvent } from 'parser/core/SpellUsage/SpellUsageSubSection';
import CastPerformanceSummary from 'analysis/retail/demonhunter/shared/guide/CastPerformanceSummary';
import {
  combineQualitativePerformances,
  qualitativePerformanceToNumber,
} from 'common/combineQualitativePerformances';
import { getEternalHuntConsumption } from 'analysis/retail/demonhunter/havoc/normalizers/EternalHuntNormalizer';

export default class EternalHunt extends Analyzer {
  // Eternal Hunt buffs
  private buffStartEvents: ApplyBuffEvent[] = [];
  private buffRemoveEvents: RemoveBuffEvent[] = [];

  private consumers: CastEvent[] = [];
  private uses: SpellUse[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_DEMON_HUNTER.ETERNAL_HUNT_1_HAVOC_TALENT,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.EMPOWERED_EYEBEAM_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.EMPOWERED_EYEBEAM_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(Events.fightend, this.finalize);
  }

  private onApplyBuff(event: ApplyBuffEvent) {
    this.buffStartEvents.push(event);
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    const consumption = getEternalHuntConsumption(event);
    console.log('Buff Removed!');
    console.log(consumption);
    if (consumption) {
      this.consumers.push(consumption);
    }
    // Maybe need to add some other push for buffs that expire without being consumed?
    this.buffRemoveEvents.push(event);
  }

  private finalize(_event: FightEndEvent) {
    this.uses = this.buffRemoveEvents.map((event) => this.explainPerformance(event));
  }

  //Check each consumer.  Will this include buffs that expired?
  private explainPerformance(event: RemoveBuffEvent): SpellUse {
    const checklistItems: ChecklistUsageInfo[] = [
      {
        check: 'eternal-hunt',
        timestamp: event.timestamp,
        ...this.eternalHuntPerformance(event),
      },
    ];

    const actualPerformance = combineQualitativePerformances(
      checklistItems.map((item) => item.performance),
    );
    return {
      event: event,
      performance: actualPerformance,
      checklistItems,
      performanceExplanation:
        actualPerformance !== QualitativePerformance.Fail
          ? `${actualPerformance} Usage`
          : 'Bad Usage',
    };
  }

  private eternalHuntPerformance(event: RemoveBuffEvent): UsageInfo {
    const summary = <div>Consume Eternal Hunt</div>;

    const consumption = getEternalHuntConsumption(event);

    if (consumption && consumption.ability.guid === SPELLS.ABYSSAL_GAZE.id) {
      return {
        performance: QualitativePerformance.Perfect,
        summary,
        details: (
          <div>
            You consumed your <SpellLink spell={TALENTS_DEMON_HUNTER.ETERNAL_HUNT_1_HAVOC_TALENT} />{' '}
            buff with
            <SpellLink spell={SPELLS.ABYSSAL_GAZE} />.
          </div>
        ),
      };
    }
    if (consumption && consumption.ability.guid === TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT.id) {
      return {
        performance: QualitativePerformance.Good,
        summary,
        details: (
          <div>
            You consumed your <SpellLink spell={TALENTS_DEMON_HUNTER.ETERNAL_HUNT_1_HAVOC_TALENT} />{' '}
            buff with
            <SpellLink spell={TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT} />.
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Fail,
      summary,
      details: (
        <div>
          You did not consume <SpellLink spell={TALENTS_DEMON_HUNTER.ETERNAL_HUNT_1_HAVOC_TALENT} />
          !
        </div>
      ),
    };
  }

  guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }

    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS_DEMON_HUNTER.ETERNAL_HUNT_1_HAVOC_TALENT} />
          </strong>{' '}
          empowers your next <SpellLink spell={TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT} /> within 12
          seconds after using <SpellLink spell={TALENTS_DEMON_HUNTER.THE_HUNT_HAVOC_TALENT} />
        </p>
        <p>
          Spend this on <SpellLink spell={SPELLS.ABYSSAL_GAZE} /> every time it's up to empower it
          further. Without <SpellLink spell={SPELLS.ABYSSAL_GAZE} />, spend it on a normal{' '}
          <SpellLink spell={TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT} />
        </p>
      </>
    );

    const goodWindows = this.uses.filter(
      (use) =>
        qualitativePerformanceToNumber(use.performance) >=
        qualitativePerformanceToNumber(QualitativePerformance.Good),
    ).length;

    return (
      <ContextualSpellUsageSubSection
        title="Eternal Hunt"
        explanation={explanation}
        uses={this.uses}
        castBreakdownSmallText={
          <>- Each box represents one Eternal Hunt use, graded by how it was consumed.</>
        }
        onPerformanceBoxClick={logSpellUseEvent}
        abovePerformanceDetails={
          this.uses.length > 0 ? (
            <div style={{ marginBottom: 10 }}>
              <CastPerformanceSummary
                spell={TALENTS_DEMON_HUNTER.ETERNAL_HUNT_1_HAVOC_TALENT}
                casts={goodWindows}
                performance={QualitativePerformance.Good}
                totalCasts={this.uses.length}
              />
            </div>
          ) : undefined
        }
        noCastsTexts={{
          noCastsOverride: 'No Eternal Hunt buffs were found in this log.',
        }}
      />
    );
  }

  //To show a box on statistics page
  statistic() {
    const eyeBeamConsumptions = this.consumers.filter(
      (cast) => cast.ability.guid === TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT.id,
    );
    const abyssalGazeConsumptions = this.consumers.filter(
      (cast) => cast.ability.guid === SPELLS.ABYSSAL_GAZE.id,
    );
    const totalConsumptions = this.consumers.length;
    const totalBuffs = this.buffStartEvents.length;

    return (
      <>
        <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
          <TalentSpellText talent={TALENTS_DEMON_HUNTER.ETERNAL_HUNT_1_HAVOC_TALENT}>
            {totalBuffs} <small>Total buffs applied</small>
            {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
            <br />
            {abyssalGazeConsumptions.length} <small>Consumed by Abyssal Gaze</small>
            {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
            <br />
            {eyeBeamConsumptions.length} <small>Consumed by Eye Beam</small>
            {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
            <br />
            {totalBuffs - totalConsumptions} <small>Wasted Buffs</small>
          </TalentSpellText>
        </Statistic>
      </>
    );
  }
}
