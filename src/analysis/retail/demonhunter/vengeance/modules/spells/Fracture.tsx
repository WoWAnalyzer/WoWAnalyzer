import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/demonhunter';
import SPELLS from 'common/SPELLS/demonhunter';
import { SpellLink } from 'interface';
import Events, { CastEvent, RemoveBuffStackEvent } from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import {
  UNRESTRAINED_FURY_SCALING,
  UNTETHERED_FURY_SCALING,
} from 'analysis/retail/demonhunter/shared';
import {
  ChecklistUsageInfo,
  SpellUse,
  spellUseToBoxRowEntry,
  UsageInfo,
} from 'parser/core/SpellUsage/core';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { logSpellUseEvent } from 'parser/core/SpellUsage/SpellUsageSubSection';
import ResourceLink from 'interface/ResourceLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import CastPerformanceSummary from 'analysis/retail/demonhunter/shared/guide/CastPerformanceSummary';
import ContextualSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import {
  getGeneratingCast,
  getResourceChange,
  getWastedSoulFragment,
} from 'analysis/retail/demonhunter/vengeance/normalizers/ShearFractureNormalizer';
import Combatant from 'parser/core/Combatant';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';

const DEFAULT_IN_META_FURY_LIMIT = 55;
const DEFAULT_NOT_META_FURY_LIMIT = 75;

const IN_META_SOUL_FRAGMENTS_LIMIT = 3;
const NOT_META_SOUL_FRAGMENTS_LIMIT = 4;

function getTalentMaxFuryIncreases(combatant: Combatant) {
  return (
    UNRESTRAINED_FURY_SCALING[combatant.getTalentRank(TALENTS.UNRESTRAINED_FURY_TALENT)] +
    UNTETHERED_FURY_SCALING[combatant.getTalentRank(TALENTS.UNTETHERED_FURY_TALENT)]
  );
}

export default class Fracture extends Analyzer {
  #cooldownUses: SpellUse[] = [];
  #inMetaFuryLimit = DEFAULT_IN_META_FURY_LIMIT;
  #notMetaFuryLimit = DEFAULT_NOT_META_FURY_LIMIT;
  #lastCast: CastEvent | undefined;
  #badCasts = 0;

  constructor(options: Options) {
    super(options);

    this.#inMetaFuryLimit =
      DEFAULT_IN_META_FURY_LIMIT + getTalentMaxFuryIncreases(this.selectedCombatant);
    this.#notMetaFuryLimit =
      DEFAULT_NOT_META_FURY_LIMIT + getTalentMaxFuryIncreases(this.selectedCombatant);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FRACTURE), this.onCast);
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SOUL_FRAGMENT_STACK),
      this.onSoulFragmentBuffFade,
    );
  }

  guideSubsection() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.FRACTURE} />
        </strong>{' '}
        is your primary <strong>builder</strong> for <ResourceLink id={RESOURCE_TYPES.FURY.id} />{' '}
        and <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />
        s. Cast it when you have less than 4 <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s and
        less than {this.#notMetaFuryLimit} <ResourceLink id={RESOURCE_TYPES.FURY.id} />. In{' '}
        <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} />, cast it when you have less than 3{' '}
        <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s and less than {this.#inMetaFuryLimit}{' '}
        <ResourceLink id={RESOURCE_TYPES.FURY.id} />.
      </p>
    );

    const performances = this.#cooldownUses.map((it) =>
      spellUseToBoxRowEntry(it, this.owner.fight.start_time),
    );

    const goodCasts = performances.filter((it) => it.value === QualitativePerformance.Good).length;
    const totalCasts = performances.length;

    return (
      <ContextualSpellUsageSubSection
        explanation={explanation}
        uses={this.#cooldownUses}
        castBreakdownSmallText={<> - Green is a good cast, Red is a bad cast.</>}
        onPerformanceBoxClick={logSpellUseEvent}
        abovePerformanceDetails={
          <CastPerformanceSummary
            spell={SPELLS.FRACTURE}
            casts={goodCasts}
            performance={QualitativePerformance.Good}
            totalCasts={totalCasts}
          />
        }
      />
    );
  }

  get wastedCasts(): NumberThreshold {
    return {
      actual: this.#badCasts,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  private onCast(event: CastEvent) {
    // Fractures are good IF:
    // in Metamorphosis - < 3 Soul Fragments and < inMetaFury Fury
    // out of Metamorphosis - < 4 Soul Fragments and < notMetaFury Fury
    const hasMetamorphosis = this.selectedCombatant.hasBuff(
      SPELLS.METAMORPHOSIS_TANK.id,
      event.timestamp,
    );

    const hasExtraDetails = hasMetamorphosis;
    const extraDetails = (
      <div>
        {hasMetamorphosis && (
          <p>
            Was in <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} />, increasing Fury and Soul
            Fragment generation
          </p>
        )}
      </div>
    );

    const checklistItems: ChecklistUsageInfo[] = [
      { check: 'fury', timestamp: event.timestamp, ...this.getCastFuryPerformance(event) },
      {
        check: 'soul-fragments',
        timestamp: event.timestamp,
        ...this.getCastSoulFragmentPerformance(event),
      },
    ];
    const actualPerformance = combineQualitativePerformances(
      checklistItems.map((item) => item.performance),
    );
    this.#cooldownUses.push({
      event,
      performance: actualPerformance,
      checklistItems,
      performanceExplanation:
        actualPerformance !== QualitativePerformance.Fail
          ? `${actualPerformance} Usage`
          : 'Bad Usage',
      extraDetails: hasExtraDetails ? extraDetails : undefined,
    });
  }

  private getCastFuryPerformance(event: CastEvent): UsageInfo {
    const hasMetamorphosis = this.selectedCombatant.hasBuff(
      SPELLS.METAMORPHOSIS_TANK.id,
      event.timestamp,
    );
    const resourceChange = getResourceChange(event);

    const inMetamorphosisSummary = (
      <div>Cast at &lt; {this.#inMetaFuryLimit} Fury during Metamorphosis</div>
    );
    const nonMetamorphosisSummary = <div>Cast at &lt; {this.#notMetaFuryLimit} Fury</div>;

    if (!resourceChange) {
      return {
        performance: QualitativePerformance.Ok,
        summary: hasMetamorphosis ? inMetamorphosisSummary : nonMetamorphosisSummary,
        details: (
          <div>
            Unable to determine from logs how much <ResourceLink id={RESOURCE_TYPES.FURY.id} /> you
            had when you cast <SpellLink spell={SPELLS.FRACTURE} />.
          </div>
        ),
      };
    }

    // We need to back-calculate the fury performance due to Fracture event ordering causing the
    // FuryTracker to not have the correct value when invoking `furyTracker.current`.
    const amountNotWasted = resourceChange.resourceChange - resourceChange.waste;
    const amountOfFuryAfterChange =
      resourceChange.classResources?.find((it) => it.type === RESOURCE_TYPES.FURY.id)?.amount ?? 0;
    const amountOfFury = amountOfFuryAfterChange - amountNotWasted;

    if (hasMetamorphosis) {
      if (amountOfFury < this.#inMetaFuryLimit) {
        return {
          performance: QualitativePerformance.Good,
          summary: inMetamorphosisSummary,
          details: (
            <div>
              You cast <SpellLink spell={SPELLS.FRACTURE} /> at {amountOfFury}{' '}
              <ResourceLink id={RESOURCE_TYPES.FURY.id} /> when the recommended amount is less than{' '}
              {this.#inMetaFuryLimit} during <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} />. Good
              job!
            </div>
          ),
        };
      }
      return {
        performance: QualitativePerformance.Fail,
        summary: inMetamorphosisSummary,
        details: (
          <div>
            You cast <SpellLink spell={SPELLS.FRACTURE} /> at {amountOfFury}{' '}
            <ResourceLink id={RESOURCE_TYPES.FURY.id} /> when the recommended amount is less than{' '}
            {this.#inMetaFuryLimit} during <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} />. Work on
            spending your <ResourceLink id={RESOURCE_TYPES.FURY.id} /> before pressing{' '}
            <SpellLink spell={SPELLS.FRACTURE} />.
          </div>
        ),
      };
    }
    if (amountOfFury < this.#notMetaFuryLimit) {
      return {
        performance: QualitativePerformance.Good,
        summary: nonMetamorphosisSummary,
        details: (
          <div>
            You cast <SpellLink spell={SPELLS.FRACTURE} /> at {amountOfFury}{' '}
            <ResourceLink id={RESOURCE_TYPES.FURY.id} /> when the recommended amount is less than{' '}
            {this.#notMetaFuryLimit}. Good job!
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Fail,
      summary: nonMetamorphosisSummary,
      details: (
        <div>
          You cast <SpellLink spell={SPELLS.FRACTURE} /> at {amountOfFury}{' '}
          <ResourceLink id={RESOURCE_TYPES.FURY.id} /> when the recommended amount is less than{' '}
          {this.#notMetaFuryLimit}. Work on spending your{' '}
          <ResourceLink id={RESOURCE_TYPES.FURY.id} /> before pressing{' '}
          <SpellLink spell={SPELLS.FRACTURE} />.
        </div>
      ),
    };
  }

  private getCastSoulFragmentPerformance(event: CastEvent): UsageInfo {
    const hasMetamorphosis = this.selectedCombatant.hasBuff(
      SPELLS.METAMORPHOSIS_TANK.id,
      event.timestamp,
    );
    const amountOfSoulFragments = this.selectedCombatant.getBuffStacks(
      SPELLS.SOUL_FRAGMENT_STACK.id,
      event.timestamp,
    );

    const inMetamorphosisSummary = (
      <div>Cast at &lt; {IN_META_SOUL_FRAGMENTS_LIMIT} Soul Fragments during Metamorphosis</div>
    );
    const nonMetamorphosisSummary = (
      <div>Cast at &lt; {NOT_META_SOUL_FRAGMENTS_LIMIT} Soul Fragments</div>
    );

    if (hasMetamorphosis) {
      if (amountOfSoulFragments < IN_META_SOUL_FRAGMENTS_LIMIT) {
        return {
          performance: QualitativePerformance.Good,
          summary: inMetamorphosisSummary,
          details: (
            <div>
              You cast <SpellLink spell={SPELLS.FRACTURE} /> at {amountOfSoulFragments}{' '}
              <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s when the recommended amount is less
              than {IN_META_SOUL_FRAGMENTS_LIMIT} during{' '}
              <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} />. Good job!
            </div>
          ),
        };
      }
      return {
        performance: QualitativePerformance.Fail,
        summary: inMetamorphosisSummary,
        details: (
          <div>
            You cast <SpellLink spell={SPELLS.FRACTURE} /> at {amountOfSoulFragments}{' '}
            <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s when the recommended amount is less
            than {IN_META_SOUL_FRAGMENTS_LIMIT} during{' '}
            <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} />. Work on spending your{' '}
            <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s before pressing{' '}
            <SpellLink spell={SPELLS.FRACTURE} />.
          </div>
        ),
      };
    }
    if (amountOfSoulFragments < NOT_META_SOUL_FRAGMENTS_LIMIT) {
      return {
        performance: QualitativePerformance.Good,
        summary: nonMetamorphosisSummary,
        details: (
          <div>
            You cast <SpellLink spell={SPELLS.FRACTURE} /> at {amountOfSoulFragments}{' '}
            <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s when the recommended amount is less
            than {NOT_META_SOUL_FRAGMENTS_LIMIT}. Good job!
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Fail,
      summary: nonMetamorphosisSummary,
      details: (
        <div>
          You cast <SpellLink spell={SPELLS.FRACTURE} /> at {amountOfSoulFragments}{' '}
          <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s when the recommended amount is less than{' '}
          {NOT_META_SOUL_FRAGMENTS_LIMIT} during <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} />.
          Work on spending your <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s before pressing{' '}
          <SpellLink spell={SPELLS.FRACTURE} />.
        </div>
      ),
    };
  }

  private onSoulFragmentBuffFade(event: RemoveBuffStackEvent) {
    const wastedSoulFragment = getWastedSoulFragment(event);
    if (!wastedSoulFragment) {
      return;
    }
    const generatingCast = getGeneratingCast(wastedSoulFragment);
    if (!generatingCast) {
      return;
    }

    // Exit early if the wasted soul is from the same fracture cast
    if (this.#lastCast?.timestamp === generatingCast.timestamp) {
      return;
    }

    this.#lastCast = generatingCast;
    this.#badCasts += 1;
    addInefficientCastReason(this.#lastCast, 'Fracture cast that overcapped souls');
  }
}
