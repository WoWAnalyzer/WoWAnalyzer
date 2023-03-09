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
import SPELLS from 'common/SPELLS/demonhunter';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Enemies from 'parser/shared/modules/Enemies';
import Enemy from 'parser/core/Enemy';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { Trans } from '@lingui/macro';
import { SpellLink } from 'interface';
import FieryDemiseExplanation from 'analysis/retail/demonhunter/vengeance/modules/core/FieryDemiseExplanation';
import {
  SPIRIT_BOMB_SOULS_IN_META,
  SPIRIT_BOMB_SOULS_OUT_OF_META,
} from 'analysis/retail/demonhunter/vengeance/constants';
import {
  ChecklistUsageInfo,
  SpellUse,
  spellUseToBoxRowEntry,
  UsageInfo,
} from 'parser/core/SpellUsage/core';
import SpellUsageSubSection, {
  logSpellUseEvent,
} from 'parser/core/SpellUsage/SpellUsageSubSection';
import CastPerformanceSummary from 'analysis/retail/demonhunter/shared/guide/CastPerformanceSummary';

export default class SpiritBomb extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  enemies!: Enemies;
  private cooldownUses: SpellUse[] = [];

  private soulsConsumedByAmount = Array.from({ length: 7 }, () => 0);
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT),
      this.onCast,
    );
  }

  get percentGoodCasts() {
    return (
      this.cooldownUses.filter((it) => it.performance === QualitativePerformance.Good).length /
      this.cooldownUses.length
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
    if (this.cooldownUses.length === 0) {
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

    const performances = this.cooldownUses.map((it) =>
      spellUseToBoxRowEntry(it, this.owner.fight.start_time),
    );

    const goodCasts = performances.filter((it) => it.value === QualitativePerformance.Good).length;
    const totalCasts = performances.length;

    return (
      <SpellUsageSubSection
        explanation={explanation}
        performance={performances}
        uses={this.cooldownUses}
        castBreakdownSmallText={<> - Green is a good cast, Red is a bad cast.</>}
        onPerformanceBoxClick={logSpellUseEvent}
        abovePerformanceDetails={
          <CastPerformanceSummary
            spell={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT}
            casts={goodCasts}
            performance={QualitativePerformance.Good}
            totalCasts={totalCasts}
          />
        }
      />
    );
  }

  private onCast(event: CastEvent) {
    const amountOfStacksConsumed = getSpiritBombSoulConsumptions(event).length;
    this.soulsConsumedByAmount[amountOfStacksConsumed] += 1;

    // Spirit Bomb casts are good IF:
    //   - In Fiery Demise window
    //   - In Meta - SPIRIT_BOMB_SOULS_IN_META+ souls consumed
    //   - Not in Meta - SPIRIT_BOMB_SOULS_IN_META+ souls consumed
    const checklistItems: ChecklistUsageInfo[] = [
      {
        check: 'consumption',
        timestamp: event.timestamp,
        ...this.getCastConsumptionPerformance(event),
      },
      {
        check: 'single-target',
        timestamp: event.timestamp,
        ...this.getCastSingleTargetPerformance(event),
      },
    ];
    const actualPerformance = combineQualitativePerformances(
      checklistItems.map((item) => item.performance),
      QualitativePerformance.Good,
    );
    this.cooldownUses.push({
      event,
      performance: actualPerformance,
      checklistItems,
      performanceExplanation:
        actualPerformance !== QualitativePerformance.Fail
          ? `${actualPerformance} Usage`
          : 'Bad Usage',
    });
  }

  private getCastSingleTargetPerformance(event: CastEvent): UsageInfo {
    const damageEvents = getSpiritBombDamages(event);
    const isAoE = damageEvents.length > 1;
    if (isAoE) {
      return {
        performance: QualitativePerformance.Good,
        summary: <div>Cast in AoE</div>,
        details: <div>You hit {damageEvents.length} targets with this cast.</div>,
      };
    }

    const hasFieryDemise = this.selectedCombatant.hasTalent(
      TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT,
    );
    if (!hasFieryDemise) {
      return {
        performance: QualitativePerformance.Fail,
        summary: <div>Cast in Single Target with Fiery Demise</div>,
        details: (
          <div>
            You cast <SpellLink id={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT} /> in single target
            without <SpellLink id={TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT} /> talented.
          </div>
        ),
      };
    }

    const targetsThatHadFieryBrand = damageEvents
      .map((event) => this.enemies.getEntity(event))
      .filter((enemy): enemy is Enemy => enemy !== null)
      .filter((enemy) => enemy.hasBuff(SPELLS.FIERY_BRAND_DOT.id, event.timestamp));
    if (targetsThatHadFieryBrand.length === 0) {
      return {
        performance: QualitativePerformance.Fail,
        summary: <div>Cast in Single Target with Fiery Demise</div>,
        details: (
          <div>
            You cast <SpellLink id={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT} /> in single target
            without <SpellLink id={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} /> applied to the
            target.
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Fail,
      summary: <div>Cast in Single Target with Fiery Demise</div>,
      details: (
        <div>
          You cast <SpellLink id={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT} /> in single target with{' '}
          <SpellLink id={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} /> applied to the target. Good
          job!
        </div>
      ),
    };
  }

  private getCastConsumptionPerformance(event: CastEvent): UsageInfo {
    const amountOfStacksConsumed = getSpiritBombSoulConsumptions(event).length;
    const hasMetamorphosis = this.selectedCombatant.hasBuff(
      SPELLS.METAMORPHOSIS_TANK.id,
      event.timestamp,
    );
    if (hasMetamorphosis) {
      if (amountOfStacksConsumed >= SPIRIT_BOMB_SOULS_IN_META) {
        return {
          performance: QualitativePerformance.Good,
          summary: (
            <div>Cast at &gt;= {SPIRIT_BOMB_SOULS_IN_META} Soul Fragments in Metamorphosis</div>
          ),
          details: (
            <div>
              You cast <SpellLink id={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT} /> at{' '}
              {amountOfStacksConsumed} <SpellLink id={SPELLS.SOUL_FRAGMENT_STACK} />
              s. Good job!
            </div>
          ),
        };
      }
      return {
        performance: QualitativePerformance.Good,
        summary: <div>Cast at &gt;= {SPIRIT_BOMB_SOULS_IN_META} Soul Fragments</div>,
        details: (
          <div>
            You cast <SpellLink id={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT} /> at{' '}
            {amountOfStacksConsumed} <SpellLink id={SPELLS.SOUL_FRAGMENT_STACK} />
            s. <SpellLink id={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT} /> should be cast at{' '}
            {SPIRIT_BOMB_SOULS_IN_META} while in <SpellLink id={SPELLS.METAMORPHOSIS_TANK} />.
          </div>
        ),
      };
    }
    if (amountOfStacksConsumed >= SPIRIT_BOMB_SOULS_OUT_OF_META) {
      return {
        performance: QualitativePerformance.Good,
        summary: <div>Cast at &gt;= {SPIRIT_BOMB_SOULS_OUT_OF_META} Soul Fragments</div>,
        details: (
          <div>
            You cast <SpellLink id={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT} /> at{' '}
            {amountOfStacksConsumed} <SpellLink id={SPELLS.SOUL_FRAGMENT_STACK} />
            s. Good job!
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Good,
      summary: <div>Cast at &gt;= {SPIRIT_BOMB_SOULS_OUT_OF_META} Soul Fragments</div>,
      details: (
        <div>
          You cast <SpellLink id={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT} /> at{' '}
          {amountOfStacksConsumed} <SpellLink id={SPELLS.SOUL_FRAGMENT_STACK} />
          s. <SpellLink id={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT} /> should be cast at{' '}
          {SPIRIT_BOMB_SOULS_OUT_OF_META}.
        </div>
      ),
    };
  }
}
