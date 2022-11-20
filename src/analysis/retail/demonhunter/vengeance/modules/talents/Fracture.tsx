import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import TALENTS from 'common/TALENTS/demonhunter';
import SPELLS from 'common/SPELLS/demonhunter';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { SpellLink } from 'interface';
import Events, { CastEvent } from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import FuryTracker from 'analysis/retail/demonhunter/vengeance/modules/resourcetracker/FuryTracker';
import { formatPercentage } from 'common/format';
import CastSummaryAndBreakdown from 'analysis/retail/demonhunter/vengeance/guide/CastSummaryAndBreakdown';
import { UNRESTRAINED_FURY_SCALING } from 'analysis/retail/demonhunter/shared';
import { TIERS } from 'game/TIERS';
import { ReactNode } from 'react';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';

// Fracture fury gen (no tier): 25
// Metamorphosis Fracture fury gen (no tier): 45
// Fracture fury gen (w/ tier): 30
// Metamorphosis Fracture fury gen (w/ tier): 54
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
    furyTracker: FuryTracker,
  };

  castEntries: BoxRowEntry[] = [];
  inMetaFuryLimit = getMetaInitialFuryLimit(false);
  notMetaFuryLimit = getNonMetaInitialFuryLimit(false);
  protected enemies!: Enemies;
  protected furyTracker!: FuryTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FRACTURE_TALENT);
    if (!this.active) {
      return;
    }

    const hasT292Pc = this.selectedCombatant.has2PieceByTier(TIERS.T29);

    this.inMetaFuryLimit =
      getMetaInitialFuryLimit(hasT292Pc) +
      UNRESTRAINED_FURY_SCALING[
        this.selectedCombatant.getTalentRank(TALENTS.UNRESTRAINED_FURY_TALENT)
      ];
    this.notMetaFuryLimit =
      getNonMetaInitialFuryLimit(hasT292Pc) +
      UNRESTRAINED_FURY_SCALING[
        this.selectedCombatant.getTalentRank(TALENTS.UNRESTRAINED_FURY_TALENT)
      ];

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.FRACTURE_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    // Fractures are good IF:
    // in Metamorphosis - < 3 Soul Fragments and < inMetaFury Fury
    // out of Metamorphosis - < 4 Soul Fragments and < notMetaFury Fury
    const hasMetamorphosis = this.selectedCombatant.hasBuff(
      SPELLS.METAMORPHOSIS_TANK.id,
      event.timestamp,
    );
    const hasT292Piece = this.selectedCombatant.has2PieceByTier(TIERS.T29);
    const targetName = this.owner.getTargetName(event);

    const [furyPerformance, furyPerformanceNote] = this.getCastFuryPerformance(event);
    const [
      soulFragmentPerformance,
      soulFragmentPerformanceNote,
    ] = this.getCastSoulFragmentPerformance(event);
    const performance =
      furyPerformance === QualitativePerformance.Good &&
      soulFragmentPerformance === QualitativePerformance.Good
        ? QualitativePerformance.Good
        : QualitativePerformance.Fail;

    const tooltip = (
      <>
        @ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong> targetting{' '}
        <strong>{targetName || 'unknown'}</strong>
        <br />
        {hasMetamorphosis && (
          <>
            Was in <SpellLink id={SPELLS.METAMORPHOSIS_TANK} />, increasing Fury and Soul Fragment
            generation
            <br />
          </>
        )}
        {hasT292Piece && (
          <>
            Wearing T29 2-piece, increasing Fury Gen by 20%
            <br />
          </>
        )}
        {furyPerformanceNote}
        {soulFragmentPerformanceNote}
      </>
    );

    this.castEntries.push({ value: performance, tooltip });
  }

  getCastFuryPerformance(event: CastEvent): [QualitativePerformance, ReactNode | null] {
    const hasMetamorphosis = this.selectedCombatant.hasBuff(
      SPELLS.METAMORPHOSIS_TANK.id,
      event.timestamp,
    );
    const amountOfFury = this.furyTracker.current;

    if (hasMetamorphosis) {
      if (amountOfFury < this.inMetaFuryLimit) {
        return [QualitativePerformance.Good, null];
      }
      return [
        QualitativePerformance.Fail,
        <>
          Cast at {amountOfFury} Fury. Recommended (due to Metamorphosis): &lt;{' '}
          {this.inMetaFuryLimit}
          <br />
        </>,
      ];
    }
    if (amountOfFury < this.notMetaFuryLimit) {
      return [QualitativePerformance.Good, null];
    }
    return [
      QualitativePerformance.Fail,
      <>
        Cast at {amountOfFury} Fury. Recommended: &lt; {this.notMetaFuryLimit}
        <br />
      </>,
    ];
  }

  getCastSoulFragmentPerformance(event: CastEvent): [QualitativePerformance, ReactNode | null] {
    const hasMetamorphosis = this.selectedCombatant.hasBuff(
      SPELLS.METAMORPHOSIS_TANK.id,
      event.timestamp,
    );
    const amountOfSoulFragments = this.selectedCombatant.getBuffStacks(
      SPELLS.SOUL_FRAGMENT_STACK.id,
      event.timestamp,
    );

    if (hasMetamorphosis) {
      if (amountOfSoulFragments < IN_META_SOUL_FRAGMENTS_LIMIT) {
        return [QualitativePerformance.Good, null];
      }
      return [
        QualitativePerformance.Fail,
        <>
          Cast at {amountOfSoulFragments} Soul Fragments. Recommended (due to Metamorphosis): &lt;{' '}
          {IN_META_SOUL_FRAGMENTS_LIMIT}
          <br />
        </>,
      ];
    }
    if (amountOfSoulFragments < NOT_META_SOUL_FRAGMENTS_LIMIT) {
      return [QualitativePerformance.Good, null];
    }
    return [
      QualitativePerformance.Fail,
      <>
        Cast at {amountOfSoulFragments} Soul Fragments. Recommended: &lt;{' '}
        {NOT_META_SOUL_FRAGMENTS_LIMIT}
        <br />
      </>,
    ];
  }

  guideSubsection() {
    const numberOfFractures = this.castEntries.length;
    const numberOfGoodFractures = this.castEntries.filter(
      (it) => it.value === QualitativePerformance.Good,
    ).length;
    const numberOfBadFractures = this.castEntries.filter(
      (it) => it.value === QualitativePerformance.Fail,
    ).length;
    const goodFractures = {
      count: numberOfGoodFractures,
      label: 'Fractures',
    };
    const badFractures = {
      count: numberOfBadFractures,
      label: 'Bad Fractures',
    };

    const explanation = (
      <p>
        <strong>
          <SpellLink id={TALENTS.FRACTURE_TALENT} />
        </strong>{' '}
        is your primary <strong>builder</strong> for <strong>Fury</strong> and{' '}
        <strong>Soul Fragments</strong>. Cast it when you have less than 4 Soul Fragments and less
        than {this.notMetaFuryLimit} Fury. In <SpellLink id={SPELLS.METAMORPHOSIS_TANK} />, cast it
        when you have less than 3 Soul Fragments and less than {this.inMetaFuryLimit} Fury.
      </p>
    );
    const data = (
      <RoundedPanel>
        <p>
          <strong>{formatPercentage(numberOfGoodFractures / numberOfFractures, 1)}%</strong> of your{' '}
          <SpellLink id={TALENTS.FRACTURE_TALENT} /> casts were good.
        </p>
        <strong>Fracture casts</strong>
        <small>
          Green is a good cast, Red is a bad cast (too many Soul Fragments or too much Fury).
          Mouseover for more details. Click to expand.
        </small>
        <CastSummaryAndBreakdown
          castEntries={this.castEntries}
          good={goodFractures}
          bad={badFractures}
        />
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}
