import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS, { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import Events, { CastEvent } from 'parser/core/Events';
import {
  getSpiritBombDamages,
  getSpiritBombSoulConsumptions,
} from 'analysis/retail/demonhunter/vengeance/normalizers/SpiritBombEventLinkNormalizer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import { formatPercentage } from 'common/format';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import SPELLS from 'common/SPELLS/demonhunter';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Enemies from 'parser/shared/modules/Enemies';
import Enemy from 'parser/core/Enemy';
import { ReactNode } from 'react';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { t, Trans } from '@lingui/macro';
import { SpellLink } from 'interface';
import CastSummaryAndBreakdown from 'analysis/retail/demonhunter/shared/guide/CastSummaryAndBreakdown';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import FieryDemiseExplanation from 'analysis/retail/demonhunter/vengeance/modules/core/FieryDemiseExplanation';
import {
  SPIRIT_BOMB_SOULS_IN_META,
  SPIRIT_BOMB_SOULS_OUT_OF_META,
} from 'analysis/retail/demonhunter/vengeance/constants';

type SpiritBombBoxRowEntry = BoxRowEntry & {
  event: CastEvent;
};

export default class SpiritBomb extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  enemies!: Enemies;
  private castEntries: SpiritBombBoxRowEntry[] = [];
  private soulsConsumedByAmount = Array.from({ length: 6 }, () => 0);
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    const amountOfStacksConsumed = getSpiritBombSoulConsumptions(event).length;
    this.soulsConsumedByAmount[amountOfStacksConsumed] += 1;

    // Spirit Bomb casts are good IF:
    //   - In Fiery Demise window
    //   - In Meta - SPIRIT_BOMB_SOULS_IN_META+ souls consumed
    //   - Not in Meta - SPIRIT_BOMB_SOULS_IN_META+ souls consumed

    const [consumptionPerformance, consumptionNote] = this.getCastConsumptionPerformance(event);
    const [singleTargetPerformance, singleTargetNote] = this.getCastSingleTargetPerformance(event);
    const performance = combineQualitativePerformances([
      consumptionPerformance,
      singleTargetPerformance,
    ]);

    const tooltip = (
      <>
        @ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong>
        <br />
        {consumptionNote}
        {singleTargetNote}
      </>
    );

    this.castEntries.push({ value: performance, tooltip, event });
  }

  getCastSingleTargetPerformance(event: CastEvent): [QualitativePerformance, ReactNode] {
    const damageEvents = getSpiritBombDamages(event);
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

  getCastConsumptionPerformance(event: CastEvent): [QualitativePerformance, ReactNode] {
    const amountOfStacksConsumed = getSpiritBombSoulConsumptions(event).length;
    const hasMetamorphosis = this.selectedCombatant.hasBuff(
      SPELLS.METAMORPHOSIS_TANK.id,
      event.timestamp,
    );
    if (hasMetamorphosis) {
      if (amountOfStacksConsumed >= SPIRIT_BOMB_SOULS_IN_META) {
        return [QualitativePerformance.Good, null];
      }
      return [
        QualitativePerformance.Fail,
        <>
          Cast at {amountOfStacksConsumed} Soul Fragments. Recommended (due to Metamorphosis):{' '}
          {SPIRIT_BOMB_SOULS_IN_META}+
          <br />
        </>,
      ];
    }
    if (amountOfStacksConsumed >= SPIRIT_BOMB_SOULS_OUT_OF_META) {
      return [QualitativePerformance.Good, null];
    }
    return [
      QualitativePerformance.Fail,
      <>
        Cast at {amountOfStacksConsumed} Soul Fragments. Recommended:{' '}
        {SPIRIT_BOMB_SOULS_OUT_OF_META}+
        <br />
      </>,
    ];
  }

  get percentGoodCasts() {
    return (
      this.castEntries.filter((it) => it.value === QualitativePerformance.Good).length /
      this.castEntries.length
    );
  }

  get suggestionThresholdsEfficiency(): NumberThreshold {
    return {
      actual: this.percentGoodCasts,
      isLessThan: {
        minor: 0.9,
        average: 0.85,
        major: 0.8,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  statistic() {
    if (this.castEntries.length === 0) {
      return null;
    }
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Stacks</th>
                  <th>Casts</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(this.soulsConsumedByAmount).map((castAmount, stackAmount) => (
                  <tr key={stackAmount}>
                    <th>{stackAmount}</th>
                    <td>{castAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT}>
          {formatPercentage(this.percentGoodCasts)}% <small>good casts</small>
        </TalentSpellText>
      </Statistic>
    );
  }

  guideSubsection() {
    const explanation = (
      <p>
        <Trans id="guide.demonhunter.vengeance.sections.rotation.spritBomb.explanation">
          <strong>
            <SpellLink id={TALENTS.SPIRIT_BOMB_TALENT} />
          </strong>{' '}
          is your primary AoE <strong>spender</strong> of <strong>Fury</strong> and{' '}
          <strong>Soul Fragments</strong>. It consumes all available Soul Fragments (up to 5) and
          does more damage for each Soul Fragment consumed. Cast it when you have{' '}
          {SPIRIT_BOMB_SOULS_OUT_OF_META}+ Soul Fragments available. In{' '}
          <SpellLink id={SPELLS.METAMORPHOSIS_TANK} />, cast it when you have{' '}
          {SPIRIT_BOMB_SOULS_IN_META}+ Soul Fragments available.
          <FieryDemiseExplanation />
        </Trans>
      </p>
    );
    const data = (
      <CastSummaryAndBreakdown
        spell={TALENTS.SPIRIT_BOMB_TALENT}
        castEntries={this.castEntries}
        goodLabel={t({
          id:
            'guide.demonhunter.vengeance.sections.rotation.spiritBomb.data.summary.performance.good',
          message: 'Spirit Bombs',
        })}
        includeGoodCastPercentage
        badLabel={t({
          id:
            'guide.demonhunter.vengeance.sections.rotation.spiritBomb.data.summary.performance.bad',
          message: 'Bad Spirit Bombs',
        })}
        onClickBox={(idx) => console.log(this.castEntries[idx].event)}
      />
    );
    const noCastData = (
      <div>
        <p>
          <Trans id="guide.demonhunter.vengeance.sections.rotation.spiritBomb.noCast">
            You did not cast Spirit Bomb during this encounter.
          </Trans>
        </p>
      </div>
    );

    return (
      <ExplanationAndDataSubSection
        explanation={explanation}
        data={this.castEntries.length > 0 ? data : noCastData}
      />
    );
  }
}
