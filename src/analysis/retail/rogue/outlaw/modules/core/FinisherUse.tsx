import type { JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HasAbility } from 'parser/core/Events';
import { BadColor, GoodColor } from 'interface/guide';
import { SpellLink } from 'interface';
import DonutChart from 'parser/ui/DonutChart';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import getResourceSpent from 'parser/core/getResourceSpent';
import { FINISHERS } from '../../constants';
import Finishers from '../features/Finishers';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BetweenTheEyes from '../spells/BetweenTheEyes';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ChecklistUsageInfo, SpellUse, spellUseToBoxRowEntry } from 'parser/core/SpellUsage/core';
import SpellUsageSubSection from 'parser/core/SpellUsage/SpellUsageSubSection';
import { createChecklistItem, createSpellUse } from 'parser/core/MajorCooldowns/MajorCooldown';
import CastPerformanceSummary from 'analysis/retail/demonhunter/shared/guide/CastPerformanceSummary';

export default class FinisherUse extends Analyzer {
  static dependencies = {
    finishers: Finishers,
    spellUsable: SpellUsable,
    betweenTheEyes: BetweenTheEyes,
  };

  protected finishers!: Finishers;
  protected spellUsable!: SpellUsable;
  protected betweenTheEyes!: BetweenTheEyes;

  totalFinisherCasts = 0;
  lowCpFinisherCasts = 0;
  spellUses: SpellUse[] = [];

  hasHiddenOpportunity = this.selectedCombatant.hasTalent(TALENTS.HIDDEN_OPPORTUNITY_TALENT);
  hasKeepItRolling = this.selectedCombatant.hasTalent(TALENTS.KEEP_IT_ROLLING_TALENT);

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

    this.totalFinisherCasts += 1;

    // TODO: Finisher choice performance
    // Determine if the proper finisher was used according to a priority list
    // Can mostly just rely on the APLCheck for that for now

    const comboPointPerformance = this.comboPointPerformance(
      event,
      cpsSpent,
      this.finishers.recommendedFinisherPoints(),
    );

    switch (spellId) {
      case TALENTS.KILLING_SPREE_TALENT.id:
        this.spellUses.push(
          createSpellUse({ event }, [comboPointPerformance, this.stealthPerformance(event)]),
        );
        break;
      case SPELLS.COUP_DE_GRACE_CAST.id:
        this.spellUses.push(
          createSpellUse({ event }, [comboPointPerformance, this.stealthPerformance(event)]),
        );
        break;
      default:
        this.spellUses.push(createSpellUse({ event }, [comboPointPerformance]));
        break;
    }
  }

  private stealthPerformance(event: CastEvent, shouldBeInStealth?: boolean) {
    const isInStealth = this.finishers.isInStealth();

    if (shouldBeInStealth) {
      return createChecklistItem(
        `${event.ability.name}_stealth`,
        { event },
        {
          performance: isInStealth ? QualitativePerformance.Good : QualitativePerformance.Fail,
          summary: <div>Used inside of Stealth</div>,
          details: isInStealth ? (
            <div>You were in stealth.</div>
          ) : (
            <div>
              You were outside of stealth, <SpellLink spell={event.ability.guid} /> should only be
              use inside of stealth.
            </div>
          ),
        },
      );
    }

    return createChecklistItem(
      `${event.ability.name}_stealth`,
      { event },
      {
        performance: !isInStealth ? QualitativePerformance.Good : QualitativePerformance.Fail,
        summary: <div>Used outside of Stealth</div>,
        details: !isInStealth ? (
          <div>You were outside of stealth.</div>
        ) : (
          <div>
            You were inside of stealth, <SpellLink spell={event.ability.guid} /> should only be use
            outside of stealth.
          </div>
        ),
      },
    );
  }

  private hiddenOpportunityComboPointPerformance(
    event: CastEvent,
    cpsSpent: number,
    targetCps: number,
  ): ChecklistUsageInfo | undefined {
    // Finisher was cast at the general target cp and not the lower one
    if (cpsSpent > targetCps) {
      return;
    }

    const isGoodCP = cpsSpent >= targetCps;

    let castSummary = (
      <>
        You spent {cpsSpent} CPs casting <SpellLink spell={event.ability.guid} />.
      </>
    );
    let badCastExplanation = (
      <>
        outside of stealth, and with both <SpellLink spell={SPELLS.AUDACITY_TALENT_BUFF} /> and{' '}
        <SpellLink spell={SPELLS.OPPORTUNITY} /> missing
      </>
    );

    if (this.finishers.hasHOLowCPFinisherCondition()) {
      const activeBuff =
        this.selectedCombatant.getBuff(SPELLS.AUDACITY_TALENT_BUFF.id) ||
        this.selectedCombatant.getBuff(SPELLS.OPPORTUNITY.id);

      if (activeBuff) {
        castSummary = (
          <>
            You spent {cpsSpent} CPs casting <SpellLink spell={event.ability.guid} /> with{' '}
            <SpellLink spell={activeBuff.ability.guid} /> active.
          </>
        );
        badCastExplanation = (
          <>
            <SpellLink spell={activeBuff.ability.guid} /> is active
          </>
        );
      } else {
        castSummary = (
          <>
            You spent {cpsSpent} CPs casting <SpellLink spell={event.ability.guid} /> in stealth.
          </>
        );
        badCastExplanation = <>in stealth</>;
      }
    }

    return createChecklistItem(
      `${event.ability.name}_cp`,
      { event },
      {
        performance: isGoodCP ? QualitativePerformance.Good : QualitativePerformance.Fail,
        summary: (
          <div>
            <SpellLink spell={event.ability.guid} /> Combo Point Management
          </div>
        ),
        details: isGoodCP ? (
          castSummary
        ) : (
          <>
            {castSummary} Try to always spend at least {targetCps} CPs when {badCastExplanation}.
          </>
        ),
      },
    );
  }

  private comboPointPerformance(
    event: CastEvent,
    cpsSpent: number,
    targetCps: number,
  ): ChecklistUsageInfo | undefined {
    const isGoodCP = cpsSpent >= targetCps;
    if (!isGoodCP) {
      this.lowCpFinisherCasts += 1;
    }

    if (this.hasHiddenOpportunity) {
      const hiddenOpportunityPerformance = this.hiddenOpportunityComboPointPerformance(
        event,
        cpsSpent,
        targetCps,
      );

      if (hiddenOpportunityPerformance) {
        return hiddenOpportunityPerformance;
      }
    }

    const isInStealth = this.finishers.isInStealth();
    const standardDetails = (
      <>
        You spent {cpsSpent} CPs casting <SpellLink spell={event.ability.guid} />{' '}
        {isInStealth ? 'in stealth' : 'outside of stealth'}.
      </>
    );

    return createChecklistItem(
      `${event.ability.name}_cp`,
      { event },
      {
        performance: isGoodCP ? QualitativePerformance.Good : QualitativePerformance.Fail,
        summary: (
          <div>
            <SpellLink spell={event.ability.guid} /> Combo Point Management
          </div>
        ),
        details: isGoodCP ? (
          standardDetails
        ) : (
          <>
            {standardDetails} Try to always spend at least {targetCps} CPs when{' '}
            {isInStealth ? 'in stealth' : 'not in stealth'}.
          </>
        ),
      },
    );
  }

  get guide(): JSX.Element {
    const explanation = (
      <>
        <p>
          <strong>Finishers</strong> should typically be used at <strong>6 or more</strong> combo
          points.{' '}
          {this.selectedCombatant.hasTalent(TALENTS.SUBTERFUGE_TALENT) && (
            <>
              When inside of <SpellLink spell={SPELLS.SUBTERFUGE_BUFF} />,{' '}
              <strong>Finishers</strong> should be used at <strong>5 or more</strong> combo points.
            </>
          )}
        </p>
        {this.hasHiddenOpportunity && (
          <p>
            When playing <SpellLink spell={TALENTS.HIDDEN_OPPORTUNITY_TALENT} />{' '}
            <strong>Finishers</strong> should be used at <strong>5 or more</strong> combo points
            when either <SpellLink spell={SPELLS.AUDACITY_TALENT_BUFF} /> or{' '}
            <SpellLink spell={SPELLS.OPPORTUNITY} /> is active.
          </p>
        )}
      </>
    );

    const performances = this.spellUses.map((it) =>
      spellUseToBoxRowEntry(it, this.owner.fight.start_time),
    );

    const spellUsesPerSpell = this.spellUses.reduce<
      Record<number, { goodCasts: number; totalCasts: number }>
    >((acc, cur) => {
      // Technically not possible but the type is AnyEvent
      if (!HasAbility(cur.event)) {
        return acc;
      }

      const spellId = cur.event.ability.guid;
      if (!acc[spellId]) {
        acc[spellId] = { goodCasts: 0, totalCasts: 0 };
      }

      acc[spellId].totalCasts += 1;
      if (cur.performance === QualitativePerformance.Good) {
        acc[spellId].goodCasts += 1;
      }

      return acc;
    }, {});

    const castPerformances = Object.entries(spellUsesPerSpell)
      .sort((a, b) => b[1].totalCasts - a[1].totalCasts)
      .map(([spellId, casts]) => (
        <CastPerformanceSummary
          key={`${spellId}_cast_performance`}
          spell={parseInt(spellId)}
          casts={casts.goodCasts}
          performance={QualitativePerformance.Good}
          totalCasts={casts.totalCasts}
        />
      ));

    return (
      <SpellUsageSubSection
        explanation={explanation}
        performances={performances}
        uses={this.spellUses}
        castBreakdownSmallText={
          <> - Green is a good cast, Yellow is an ok cast, Red is a bad cast.</>
        }
        abovePerformanceDetails={castPerformances}
      />
    );
  }
}
