import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import Events, { CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/demonhunter';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ReactNode } from 'react';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import Enemy from 'parser/core/Enemy';
import { getSoulCleaveDamages } from 'analysis/retail/demonhunter/vengeance/normalizers/SoulCleaveEventLinkNormalizer';
import {
  SPIRIT_BOMB_SOULS_IN_META,
  SPIRIT_BOMB_SOULS_OUT_OF_META,
} from 'analysis/retail/demonhunter/vengeance/constants';
import { t, Trans } from '@lingui/macro';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/demonhunter';
import { formatPercentage } from 'common/format';
import CastSummaryAndBreakdown from 'analysis/retail/demonhunter/shared/guide/CastSummaryAndBreakdown';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

export default class SoulCleave extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  enemies!: Enemies;
  private castEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SOUL_CLEAVE), this.onCast);
  }

  onCast(event: CastEvent) {
    const [fieryDemisePerformance, fieryDemiseNote] = this.getCastFieryDemisePerformance(event);
    const [
      spiritBombBetterPerformance,
      spiritBombBetterNote,
    ] = this.getCastWhenSpiritBombBetterPerformance(event);
    const performance = combineQualitativePerformances([
      fieryDemisePerformance,
      spiritBombBetterPerformance,
    ]);

    const tooltip = (
      <>
        @ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong>
        <br />
        {fieryDemiseNote}
        {spiritBombBetterNote}
      </>
    );

    this.castEntries.push({ value: performance, tooltip });
  }

  getCastFieryDemisePerformance(event: CastEvent): [QualitativePerformance, ReactNode] {
    const hasFieryDemise = this.selectedCombatant.hasTalent(
      TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT,
    );
    const hasSpiritBomb = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT);
    if (!hasFieryDemise || !hasSpiritBomb) {
      return [QualitativePerformance.Good, null];
    }

    const damageEvents = getSoulCleaveDamages(event);
    const targetsThatHadFieryBrand = damageEvents
      .map((event) => this.enemies.getEntity(event))
      .filter((enemy): enemy is Enemy => enemy !== null)
      .filter((enemy) => enemy.hasBuff(SPELLS.FIERY_BRAND_DOT.id, event.timestamp));
    if (targetsThatHadFieryBrand.length > 0) {
      return [
        QualitativePerformance.Fail,
        <>
          Should have cast Spirit Bomb instead.
          <br />
        </>,
      ];
    }
    return [QualitativePerformance.Good, null];
  }

  getCastWhenSpiritBombBetterPerformance(event: CastEvent): [QualitativePerformance, ReactNode] {
    // If we don't have SpB, can't cast it instead
    const hasSpiritBomb = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT);
    if (!hasSpiritBomb) {
      return [QualitativePerformance.Good, null];
    }

    // Always prefer SC in ST apart from demise windows (handled elsewhere)
    const damageEvents = getSoulCleaveDamages(event);
    const isAoE = damageEvents.length > 1;
    if (!isAoE) {
      return [QualitativePerformance.Good, null];
    }

    const numberOfSoulFragmentsAvailable = this.selectedCombatant.getBuffStacks(
      SPELLS.SOUL_FRAGMENT_STACK.id,
      event.timestamp,
    );
    const hasMetamorphosis = this.selectedCombatant.hasBuff(
      SPELLS.METAMORPHOSIS_TANK.id,
      event.timestamp,
    );
    if (hasMetamorphosis) {
      if (numberOfSoulFragmentsAvailable < SPIRIT_BOMB_SOULS_IN_META) {
        return [QualitativePerformance.Good, null];
      }
      return [
        QualitativePerformance.Fail,
        <>
          Cast at {numberOfSoulFragmentsAvailable} Soul Fragments. Should have cast Spirit Bomb
          instead.
          <br />
        </>,
      ];
    }
    if (numberOfSoulFragmentsAvailable < SPIRIT_BOMB_SOULS_OUT_OF_META) {
      return [QualitativePerformance.Good, null];
    }
    return [
      QualitativePerformance.Fail,
      <>
        Cast at {numberOfSoulFragmentsAvailable} Soul Fragments. Should have cast Spirit Bomb
        instead.
        <br />
      </>,
    ];
  }

  getCastSingleTargetPerformance(event: CastEvent): [QualitativePerformance, ReactNode] {
    const damageEvents = getSoulCleaveDamages(event);
    const isAoE = damageEvents.length > 1;
    if (isAoE) {
      return [QualitativePerformance.Good, null];
    }

    const hasFieryDemise = this.selectedCombatant.hasTalent(
      TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT,
    );
    if (!hasFieryDemise) {
      return [QualitativePerformance.Fail, <>Cast on a single target.</>];
    }

    const targetsThatHadFieryBrand = damageEvents
      .map((event) => this.enemies.getEntity(event))
      .filter((enemy): enemy is Enemy => enemy !== null)
      .filter((enemy) => enemy.hasBuff(SPELLS.FIERY_BRAND_DOT.id, event.timestamp));
    if (targetsThatHadFieryBrand.length === 0) {
      return [
        QualitativePerformance.Fail,
        <>
          Cast on a single target without Fiery Brand applied.
          <br />
        </>,
      ];
    }
    return [QualitativePerformance.Good, null];
  }

  guideSubsection() {
    const numberOfCasts = this.castEntries.length;
    const numberOfGoodCasts = this.castEntries.filter(
      (it) => it.value === QualitativePerformance.Good,
    ).length;
    const numberOfBadCasts = this.castEntries.filter(
      (it) => it.value === QualitativePerformance.Fail,
    ).length;
    const goodCasts = {
      count: numberOfGoodCasts,
      label: t({
        id:
          'guide.demonhunter.vengeance.sections.rotation.soulCleave.data.summary.performance.good',
        message: 'Soul Cleaves',
      }),
    };
    const badCasts = {
      count: numberOfBadCasts,
      label: t({
        id: 'guide.demonhunter.vengeance.sections.rotation.soulCleave.data.summary.performance.bad',
        message: 'Bad Soul Cleaves',
      }),
    };

    const explanation = (
      <p>
        <Trans id="guide.demonhunter.vengeance.sections.rotation.soulCleave.explanation">
          <strong>
            <SpellLink id={SPELLS.SOUL_CLEAVE} />
          </strong>{' '}
          is your primary <strong>spender</strong> of <strong>Fury</strong> and{' '}
          <strong>Soul Fragments</strong>. It consumes up to 2 Soul Fragments.
          {this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT) ? (
            <>
              {' '}
              Use it when you would not otherwise use <SpellLink id={TALENTS.SPIRIT_BOMB_TALENT} />.
            </>
          ) : null}
        </Trans>
      </p>
    );
    const data = (
      <div>
        <Trans id="guide.demonhunter.vengeance.sections.rotation.soulCleave.data">
          <p>
            <strong>{formatPercentage(numberOfGoodCasts / numberOfCasts, 1)}%</strong> of your{' '}
            <SpellLink id={SPELLS.SOUL_CLEAVE} /> casts were good.
          </p>
          <strong>Soul Cleave casts</strong>{' '}
          <small>
            - Green is a good cast, Red is a bad cast. Mouseover for more details. Click to expand.
          </small>
        </Trans>
        <CastSummaryAndBreakdown castEntries={this.castEntries} good={goodCasts} bad={badCasts} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}
