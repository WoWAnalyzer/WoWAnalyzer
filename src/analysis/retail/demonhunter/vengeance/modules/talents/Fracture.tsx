import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import TALENTS from 'common/TALENTS/demonhunter';
import SPELLS from 'common/SPELLS/demonhunter';
import { SpellLink } from 'interface';
import Events, { CastEvent } from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { UNRESTRAINED_FURY_SCALING } from 'analysis/retail/demonhunter/shared';
import { UNTETHERED_FURY_SCALING } from 'analysis/retail/demonhunter/shared';
import { TIERS } from 'game/TIERS';
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
import { getResourceChange } from 'analysis/retail/demonhunter/vengeance/normalizers/ShearFractureNormalizer';

const BASE_FURY = 100;

// Fracture fury gen (no T29): 25
// Metamorphosis Fracture fury gen (no T29): 45
// Fracture fury gen (w/ T29): 30
// Metamorphosis Fracture fury gen (w/ T29): 54
const DEFAULT_IN_META_FURY_LIMIT = 55;
const DEFAULT_NOT_META_FURY_LIMIT = 75;
const T29_IN_META_FURY_LIMIT = 46;
const T29_NOT_META_FURY_LIMIT = 70;

const IN_META_SOUL_FRAGMENTS_LIMIT = 3;
const NOT_META_SOUL_FRAGMENTS_LIMIT = 4;

const getMetaInitialFuryLimit = (hasT292Pc: boolean) =>
  hasT292Pc ? T29_IN_META_FURY_LIMIT : DEFAULT_IN_META_FURY_LIMIT;
const getNonMetaInitialFuryLimit = (hasT292Pc: boolean) =>
  hasT292Pc ? T29_NOT_META_FURY_LIMIT : DEFAULT_NOT_META_FURY_LIMIT;

export default class Fracture extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  private cooldownUses: SpellUse[] = [];
  private inMetaFuryLimit = getMetaInitialFuryLimit(false);
  private notMetaFuryLimit = getNonMetaInitialFuryLimit(false);
  private maximumFury = BASE_FURY;

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FRACTURE_TALENT);
    if (!this.active) {
      return;
    }

    const hasT292Pc = this.selectedCombatant.has2PieceByTier(TIERS.DF1);

    this.maximumFury =
      BASE_FURY +
      UNRESTRAINED_FURY_SCALING[
        this.selectedCombatant.getTalentRank(TALENTS.UNRESTRAINED_FURY_TALENT)
      ] +
      UNTETHERED_FURY_SCALING[this.selectedCombatant.getTalentRank(TALENTS.UNTETHERED_FURY_TALENT)];

    this.inMetaFuryLimit =
      getMetaInitialFuryLimit(hasT292Pc) +
      UNRESTRAINED_FURY_SCALING[
        this.selectedCombatant.getTalentRank(TALENTS.UNRESTRAINED_FURY_TALENT)
      ] +
      UNTETHERED_FURY_SCALING[this.selectedCombatant.getTalentRank(TALENTS.UNTETHERED_FURY_TALENT)];
    this.notMetaFuryLimit =
      getNonMetaInitialFuryLimit(hasT292Pc) +
      UNRESTRAINED_FURY_SCALING[
        this.selectedCombatant.getTalentRank(TALENTS.UNRESTRAINED_FURY_TALENT)
      ] +
      UNTETHERED_FURY_SCALING[this.selectedCombatant.getTalentRank(TALENTS.UNTETHERED_FURY_TALENT)];

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.FRACTURE_TALENT),
      this.onCast,
    );
  }

  guideSubsection() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS.FRACTURE_TALENT} />
        </strong>{' '}
        is your primary <strong>builder</strong> for <ResourceLink id={RESOURCE_TYPES.FURY.id} />{' '}
        and <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />
        s. Cast it when you have less than 4 <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s and
        less than {this.notMetaFuryLimit} <ResourceLink id={RESOURCE_TYPES.FURY.id} />. In{' '}
        <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} />, cast it when you have less than 3{' '}
        <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s and less than {this.inMetaFuryLimit}{' '}
        <ResourceLink id={RESOURCE_TYPES.FURY.id} />.
      </p>
    );

    const performances = this.cooldownUses.map((it) =>
      spellUseToBoxRowEntry(it, this.owner.fight.start_time),
    );

    const goodCasts = performances.filter((it) => it.value === QualitativePerformance.Good).length;
    const totalCasts = performances.length;

    return (
      <ContextualSpellUsageSubSection
        explanation={explanation}
        uses={this.cooldownUses}
        castBreakdownSmallText={<> - Green is a good cast, Red is a bad cast.</>}
        onPerformanceBoxClick={logSpellUseEvent}
        abovePerformanceDetails={
          <CastPerformanceSummary
            spell={TALENTS.FRACTURE_TALENT}
            casts={goodCasts}
            performance={QualitativePerformance.Good}
            totalCasts={totalCasts}
          />
        }
      />
    );
  }

  private onCast(event: CastEvent) {
    // Fractures are good IF:
    // in Metamorphosis - < 3 Soul Fragments and < inMetaFury Fury
    // out of Metamorphosis - < 4 Soul Fragments and < notMetaFury Fury
    const hasMetamorphosis = this.selectedCombatant.hasBuff(
      SPELLS.METAMORPHOSIS_TANK.id,
      event.timestamp,
    );
    const hasT292Piece = this.selectedCombatant.has2PieceByTier(TIERS.DF1);

    const hasExtraDetails = hasMetamorphosis || hasT292Piece;
    const extraDetails = (
      <div>
        {hasMetamorphosis && (
          <p>
            Was in <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} />, increasing Fury and Soul
            Fragment generation
          </p>
        )}
        {hasT292Piece && <p>Wearing T29 2-piece, increasing Fury Gen by 20%</p>}
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
    this.cooldownUses.push({
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
      <div>Cast at &lt; {this.inMetaFuryLimit} Fury during Metamorphosis</div>
    );
    const nonMetamorphosisSummary = <div>Cast at &lt; {this.notMetaFuryLimit} Fury</div>;

    if (!resourceChange) {
      return {
        performance: QualitativePerformance.Ok,
        summary: hasMetamorphosis ? inMetamorphosisSummary : nonMetamorphosisSummary,
        details: (
          <div>
            Unable to determine from logs how much <ResourceLink id={RESOURCE_TYPES.FURY.id} /> you
            had when you cast <SpellLink spell={TALENTS.FRACTURE_TALENT} />.
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
      if (amountOfFury < this.inMetaFuryLimit) {
        return {
          performance: QualitativePerformance.Good,
          summary: inMetamorphosisSummary,
          details: (
            <div>
              You cast <SpellLink spell={TALENTS.FRACTURE_TALENT} /> at {amountOfFury}{' '}
              <ResourceLink id={RESOURCE_TYPES.FURY.id} /> when the recommended amount is less than{' '}
              {this.inMetaFuryLimit} during <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} />. Good
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
            You cast <SpellLink spell={TALENTS.FRACTURE_TALENT} /> at {amountOfFury}{' '}
            <ResourceLink id={RESOURCE_TYPES.FURY.id} /> when the recommended amount is less than{' '}
            {this.inMetaFuryLimit} during <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} />. Work on
            spending your <ResourceLink id={RESOURCE_TYPES.FURY.id} /> before pressing{' '}
            <SpellLink spell={TALENTS.FRACTURE_TALENT} />.
          </div>
        ),
      };
    }
    if (amountOfFury < this.notMetaFuryLimit) {
      return {
        performance: QualitativePerformance.Good,
        summary: nonMetamorphosisSummary,
        details: (
          <div>
            You cast <SpellLink spell={TALENTS.FRACTURE_TALENT} /> at {amountOfFury}{' '}
            <ResourceLink id={RESOURCE_TYPES.FURY.id} /> when the recommended amount is less than{' '}
            {this.notMetaFuryLimit}. Good job!
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Fail,
      summary: nonMetamorphosisSummary,
      details: (
        <div>
          You cast <SpellLink spell={TALENTS.FRACTURE_TALENT} /> at {amountOfFury}{' '}
          <ResourceLink id={RESOURCE_TYPES.FURY.id} /> when the recommended amount is less than{' '}
          {this.notMetaFuryLimit}. Work on spending your{' '}
          <ResourceLink id={RESOURCE_TYPES.FURY.id} /> before pressing{' '}
          <SpellLink spell={TALENTS.FRACTURE_TALENT} />.
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
              You cast <SpellLink spell={TALENTS.FRACTURE_TALENT} /> at {amountOfSoulFragments}{' '}
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
            You cast <SpellLink spell={TALENTS.FRACTURE_TALENT} /> at {amountOfSoulFragments}{' '}
            <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s when the recommended amount is less
            than {IN_META_SOUL_FRAGMENTS_LIMIT} during{' '}
            <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} />. Work on spending your{' '}
            <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s before pressing{' '}
            <SpellLink spell={TALENTS.FRACTURE_TALENT} />.
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
            You cast <SpellLink spell={TALENTS.FRACTURE_TALENT} /> at {amountOfSoulFragments}{' '}
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
          You cast <SpellLink spell={TALENTS.FRACTURE_TALENT} /> at {amountOfSoulFragments}{' '}
          <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s when the recommended amount is less than{' '}
          {NOT_META_SOUL_FRAGMENTS_LIMIT} during <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} />.
          Work on spending your <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s before pressing{' '}
          <SpellLink spell={TALENTS.FRACTURE_TALENT} />.
        </div>
      ),
    };
  }
}
