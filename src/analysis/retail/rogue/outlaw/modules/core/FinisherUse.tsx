import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, TargettedEvent } from 'parser/core/Events';
import { BadColor, GoodColor } from 'interface/guide';
import { SpellLink } from 'interface';
import DonutChart from 'parser/ui/DonutChart';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import getResourceSpent from 'parser/core/getResourceSpent';
import { FINISHERS, getMaxComboPoints } from '../../constants';
import Finishers from '../features/Finishers';
import SPELLS from 'common/SPELLS';
import TALENTS, { TALENTS_ROGUE } from 'common/TALENTS/rogue';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BetweenTheEyes from '../spells/BetweenTheEyes';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ChecklistUsageInfo, SpellUse, spellUseToBoxRowEntry } from 'parser/core/SpellUsage/core';
import { ReactNode } from 'react';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import SpellUsageSubSection from 'parser/core/SpellUsage/SpellUsageSubSection';
import { formatDurationMillisMinSec } from 'common/format';

const BTE_ACCEPTABLE_REFRESH_TIME = 6000;
const BTE_FLAG_REFRESH_TIME = 4000;

//-- TODO: Add a slice and dice module to track buff remaining duration, not really necessary as of now since we barely press the spell
//         Find a log that actually plays with improved between the eyes to check if everything is correct

export default class FinisherUse extends Analyzer {
  static dependencies = {
    finishers: Finishers,
    spellUsable: SpellUsable,
    betweenTheEyes: BetweenTheEyes,
  };

  protected finishers!: Finishers;
  protected spellUsable!: SpellUsable;
  protected betweenTheEyes!: BetweenTheEyes;

  protected hasImprovedBteTalent = this.selectedCombatant.hasTalent(
    TALENTS_ROGUE.IMPROVED_BETWEEN_THE_EYES_TALENT,
  );
  protected hasCountTheOddsTalent = this.selectedCombatant.hasTalent(
    TALENTS_ROGUE.COUNT_THE_ODDS_TALENT,
  );
  protected hasGreenskinTalent = this.selectedCombatant.hasTalent(
    TALENTS_ROGUE.GREENSKINS_WICKERS_TALENT,
  );

  totalFinisherCasts = 0;
  lowCpFinisherCasts = 0;
  spellUses: SpellUse[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(FINISHERS), this.onCast);
  }

  get maxCpFinishers() {
    return this.totalFinisherCasts - this.lowCpFinisherCasts;
  }

  get chart() {
    const items = [
      {
        color: GoodColor,
        label: 'Max CP Finishers',
        value: this.maxCpFinishers,
        tooltip: (
          <>This includes finishers cast at {getMaxComboPoints(this.selectedCombatant) - 1} CPs.</>
        ),
      },
      {
        color: BadColor,
        label: 'Low CP Finishers',
        value: this.lowCpFinisherCasts,
      },
    ];

    return <DonutChart items={items} />;
  }

  private onCast(event: CastEvent) {
    const cpsSpent = getResourceSpent(event, RESOURCE_TYPES.COMBO_POINTS);
    const spellId = event.ability.guid;

    if (cpsSpent === 0) {
      return;
    }

    //- CP performance

    const targetCps = this.finishers.recommendedFinisherPoints();
    let cpsPerformance = QualitativePerformance.Good;
    let cpsSummary: ReactNode;
    let cpsDetails: ReactNode;

    this.totalFinisherCasts += 1;
    if (cpsSpent < targetCps) {
      this.lowCpFinisherCasts += 1;

      cpsPerformance = QualitativePerformance.Fail;
      cpsSummary = <div>Spend &gt;= {targetCps} CPs</div>;
      cpsDetails = (
        <div>
          You spent {cpsSpent} CPs. Try to always spend at least {targetCps} CPs when casting a
          finisher.
        </div>
      );
    } else {
      cpsSummary = <div>Spent &gt;= {targetCps} CPs</div>;
      cpsDetails = <div>You spent {cpsSpent} CPs.</div>;
    }

    //- Finisher choice performance
    const checklistFinisherChoice: ChecklistUsageInfo = {
      check: 'finisher choice',
      timestamp: event.timestamp,
      performance: QualitativePerformance.Good,
      summary: <></>,
      details: (
        <>
          You cast <SpellLink spell={spellId} />{' '}
        </>
      ),
    };

    const bteDebuffRemainingTime = this.betweenTheEyes.getTimeRemaining(
      event as TargettedEvent<any>,
    );
    const bteCDRemainingTime = this.spellUsable.cooldownRemaining(SPELLS.BETWEEN_THE_EYES.id);

    if (this.hasGreenskinTalent) {
      checklistFinisherChoice.summary = (
        <div>
          Time remaining on between the eyes cooldown:{' '}
          {formatDurationMillisMinSec(bteCDRemainingTime)}
        </div>
      );
    } else {
      checklistFinisherChoice.summary = (
        <div>
          Time remaining on between the eyes debuff:{' '}
          {formatDurationMillisMinSec(bteDebuffRemainingTime)}
        </div>
      );
    }

    switch (spellId) {
      case SPELLS.BETWEEN_THE_EYES.id:
        this.bteCondition(event, checklistFinisherChoice);
        break;
      case SPELLS.SLICE_AND_DICE.id:
        // Add SnD remaining time here
        checklistFinisherChoice.details = <div>{checklistFinisherChoice.details}.</div>;

        if (!this.bteCheck(event, checklistFinisherChoice)) {
          const hasSnD = this.selectedCombatant.getBuff(
            SPELLS.SLICE_AND_DICE.id,
            event.timestamp,
            0,
            200,
          );
          if (!hasSnD) {
            checklistFinisherChoice.summary = <div>No slice and dice buff running</div>;
          }
        }
        break;
      case SPELLS.DISPATCH.id:
        if (!this.bteCheck(event, checklistFinisherChoice)) {
          this.dispatchCondition(event, checklistFinisherChoice);
        }
        break;
      default:
        checklistFinisherChoice.details = <div>{checklistFinisherChoice.details}.</div>;
        break;
    }

    const checklistItems: ChecklistUsageInfo[] = [
      checklistFinisherChoice,
      {
        check: 'cps',
        timestamp: event.timestamp,
        performance: cpsPerformance,
        summary: cpsSummary,
        details: cpsDetails,
      },
    ];

    const performance = combineQualitativePerformances(checklistItems.map((it) => it.performance));

    this.spellUses.push({
      event,
      performance: performance,
      checklistItems: checklistItems,
      performanceExplanation:
        performance !== QualitativePerformance.Fail ? `${performance} Usage` : 'Bad Usage',
    });
  }

  get guide(): JSX.Element {
    const explanation = (
      <p>
        <strong>Finishers</strong> should typically be used at 1 below max combo points or higher.
        You want to maintain as close to possible 100% uptime on both{' '}
        <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> and{' '}
        <SpellLink spell={SPELLS.SLICE_AND_DICE} /> buff.
        {this.hasGreenskinTalent && (
          <p>
            {' '}
            Since you are talented into <SpellLink spell={TALENTS.GREENSKINS_WICKERS_TALENT} /> you
            want to cast <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> as close to on cd as possible
            to maximise the proc uptime.
          </p>
        )}
      </p>
    );

    const performances = this.spellUses.map((it) =>
      spellUseToBoxRowEntry(it, this.owner.fight.start_time),
    );

    return (
      <SpellUsageSubSection
        explanation={explanation}
        performances={performances}
        uses={this.spellUses}
        castBreakdownSmallText={
          <> - Green is a good cast, Yellow is an ok cast, Red is a bad cast.</>
        }
      />
    );
  }

  private bteCheck(event: CastEvent, checkListFinisher: ChecklistUsageInfo): boolean {
    const wasBtEReady = this.spellUsable.isAvailable(SPELLS.BETWEEN_THE_EYES.id);

    if (!wasBtEReady) {
      return false;
    }

    const hasRuthlessPrecisionBuff = this.selectedCombatant.hasBuff(SPELLS.RUTHLESS_PRECISION.id);
    const hasGreenskinBuff = this.selectedCombatant.hasBuff(
      TALENTS_ROGUE.GREENSKINS_WICKERS_TALENT.id,
    );
    const hasShadowDanceBuff = this.selectedCombatant.hasBuff(SPELLS.SHADOW_DANCE_BUFF.id);
    const bteRemainingTime = this.betweenTheEyes.getTimeRemaining(event as TargettedEvent<any>);

    if (this.hasGreenskinTalent && !hasGreenskinBuff) {
      checkListFinisher.performance = QualitativePerformance.Fail;
      checkListFinisher.summary = <div>Between the eyes was ready</div>;
      checkListFinisher.details = (
        <div>
          {checkListFinisher.details} with <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> off
          cooldown, when talented into <SpellLink spell={TALENTS_ROGUE.GREENSKINS_WICKERS_TALENT} />{' '}
          you should try to use <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> as much on cd as
          possible.
        </div>
      );
      return true;
    }

    if (this.hasCountTheOddsTalent && hasShadowDanceBuff) {
      return false;
    }

    if (this.hasImprovedBteTalent && hasRuthlessPrecisionBuff) {
      checkListFinisher.performance = QualitativePerformance.Fail;
      checkListFinisher.summary = <div>Between the eyes was ready</div>;
      checkListFinisher.details = (
        <div>
          {checkListFinisher.details} with <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> off
          cooldown, when talented into{' '}
          <SpellLink spell={TALENTS_ROGUE.IMPROVED_BETWEEN_THE_EYES_TALENT} /> try to use{' '}
          <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> on cooldown with{' '}
          <SpellLink spell={SPELLS.RUTHLESS_PRECISION} /> buff up.
        </div>
      );
      return true;
    }

    if (!bteRemainingTime) {
      checkListFinisher.performance = QualitativePerformance.Fail;
      checkListFinisher.summary = <div>Between the eyes debuff was missing from the target</div>;
      checkListFinisher.details = (
        <div>
          {checkListFinisher.details} with no <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> debuff
          up and the spell ready to use, never let <SpellLink spell={SPELLS.BETWEEN_THE_EYES} />{' '}
          debuff fall off.
        </div>
      );
      return true;
    }

    if (bteRemainingTime < BTE_FLAG_REFRESH_TIME) {
      checkListFinisher.performance = QualitativePerformance.Ok;
      checkListFinisher.summary = (
        <div>
          Time remaining on between the eyes: {formatDurationMillisMinSec(bteRemainingTime)}
        </div>
      );
      checkListFinisher.details = (
        <div>
          You cast <SpellLink spell={SPELLS.DISPATCH} /> with{' '}
          <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> off cooldown and{' '}
          {formatDurationMillisMinSec(bteRemainingTime)} left on its debuff, try to refresh{' '}
          <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> debuff early to not let it fall off.
        </div>
      );
      return true;
    }

    return false;
  }

  private bteCondition(event: CastEvent, checkListFinisher: ChecklistUsageInfo) {
    const bteDebuffRemainingTime = this.betweenTheEyes.getTimeRemaining(
      event as TargettedEvent<any>,
    );
    const hasGreenskinBuff = this.selectedCombatant.hasBuff(
      TALENTS_ROGUE.GREENSKINS_WICKERS_TALENT.id,
    );

    if (this.hasGreenskinTalent) {
      if (hasGreenskinBuff) {
        checkListFinisher.performance = QualitativePerformance.Ok;
        checkListFinisher.summary = <div>Greenskin Wickers buff was already present</div>;
        checkListFinisher.details = (
          <div>
            You used <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> with a{' '}
            <SpellLink spell={TALENTS_ROGUE.GREENSKINS_WICKERS_TALENT} /> buff already present, try
            to not override your <SpellLink spell={TALENTS_ROGUE.GREENSKINS_WICKERS_TALENT} />{' '}
            buffs.
          </div>
        );
      } else {
        checkListFinisher.summary = <div>Between the eyes used</div>;
        checkListFinisher.details = (
          <div>
            You used <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> and gained a{' '}
            <SpellLink spell={TALENTS_ROGUE.GREENSKINS_WICKERS_TALENT} /> buff.
          </div>
        );
      }
    } else if (bteDebuffRemainingTime > BTE_ACCEPTABLE_REFRESH_TIME && !this.hasImprovedBteTalent) {
      checkListFinisher.performance = QualitativePerformance.Ok;
      checkListFinisher.details = (
        <div>
          You used <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> with{' '}
          {formatDurationMillisMinSec(bteDebuffRemainingTime)} left on the debuff, since you aren't
          playing <SpellLink spell={TALENTS_ROGUE.GREENSKINS_WICKERS_TALENT} /> talent, you do not
          need to refresh the debuff this early, try to instead keep the cooldown ready in case of
          target swapping for example. Refreshing the debuff early before a{' '}
          <SpellLink spell={TALENTS_ROGUE.SHADOW_DANCE_TALENT} /> window is however fine.
        </div>
      );
    } else if (bteDebuffRemainingTime === 0) {
      checkListFinisher.summary = <div>Between the eyes debuff applied</div>;
      checkListFinisher.details = (
        <div>
          You applied <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> debuff.
        </div>
      );
    } else {
      checkListFinisher.details = (
        <div>
          You used <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> with{' '}
          {formatDurationMillisMinSec(bteDebuffRemainingTime)} left on the debuff.
        </div>
      );
    }
  }

  private dispatchCondition(event: CastEvent, checkListFinisher: ChecklistUsageInfo) {
    const bteDebuffRemainingTime = this.betweenTheEyes.getTimeRemaining(
      event as TargettedEvent<any>,
    );
    const bteCDRemainingTime = this.spellUsable.cooldownRemaining(SPELLS.BETWEEN_THE_EYES.id);
    const hasSnD = this.selectedCombatant.getBuff(
      SPELLS.SLICE_AND_DICE.id,
      event.timestamp,
      0,
      200,
    );

    if (!hasSnD && !this.selectedCombatant.hasBuff(SPELLS.GRAND_MELEE.id)) {
      checkListFinisher.performance = QualitativePerformance.Fail;
      checkListFinisher.summary = <div>Slice and dice buff was missing</div>;
      checkListFinisher.details = (
        <div>
          {checkListFinisher.details} with <SpellLink spell={SPELLS.SLICE_AND_DICE} /> buff down,
          try to maintain the buff at all time.
        </div>
      );
    } else if (this.hasGreenskinTalent) {
      checkListFinisher.details = (
        <div>
          {checkListFinisher.details} with {formatDurationMillisMinSec(bteCDRemainingTime)} left on{' '}
          <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> cooldown.
        </div>
      );
    } else {
      checkListFinisher.details = (
        <div>
          {checkListFinisher.details} with {formatDurationMillisMinSec(bteDebuffRemainingTime)} left
          on <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> debuff.
        </div>
      );
    }
  }
}
