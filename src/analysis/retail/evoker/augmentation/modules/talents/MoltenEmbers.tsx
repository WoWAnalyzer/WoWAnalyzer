import type { JSX } from 'react';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent, EmpowerEndEvent, GetRelatedEvents } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { MOLTEN_EMBERS_MULTIPLIER } from '../../constants';
import { BLACK_DAMAGE_SPELLS } from 'analysis/retail/evoker/shared/constants';
import Enemies from 'parser/shared/modules/Enemies';
import { Talent } from 'common/TALENTS/types';
import Spell from 'common/SPELLS/Spell';
import DonutChart from 'parser/ui/DonutChart';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import {
  UPHEAVAL_CAST_DAM_LINK,
  UPHEAVAL_REVERBERATION_DAM_LINK,
} from '../normalizers/CastLinkNormalizer';
import SpellLink from 'interface/SpellLink';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import ContextualSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';

type DamageSources = Record<number, { amount: number; spell: Spell | Talent }>;

const COLORS = [
  '#813405',
  'rgb(212, 81, 19)',
  'rgb(255, 255, 0)',
  'rgb(153, 102, 255)',
  'rgb(255, 159, 64)',
  'rgb(255, 206, 86)',
];

interface UpheavalCast {
  event: EmpowerEndEvent;
  fireBreathActive: boolean;
  fireBreathRank: number;
}

/**
 * Fire Breath causes enemies to take 25% increased damage from your Black spells.
 */
class MoltenEmbers extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  private uses: SpellUse[] = [];
  private upheavalCasts: UpheavalCast[] = [];

  previousFireBreathRank = 0;
  totalMoltenEmbersDamage = 0;
  moltenEmbersDamageSources: DamageSources = {};

  hasReverberations = false;
  perfectFireBreathRank = 1;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MOLTEN_EMBERS_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(BLACK_DAMAGE_SPELLS),
      this.onDamage,
    );

    this.addEventListener(
      Events.empowerEnd.by(SELECTED_PLAYER).spell([TALENTS.UPHEAVAL_TALENT, SPELLS.UPHEAVAL_FONT]),
      this.onUpheavalCast,
    );
    this.addEventListener(
      Events.empowerEnd.by(SELECTED_PLAYER).spell([SPELLS.FIRE_BREATH, SPELLS.FIRE_BREATH_FONT]),
      this.onFireBreathCast,
    );

    this.addEventListener(Events.fightend, this.finalize);

    for (const spell of BLACK_DAMAGE_SPELLS) {
      this.moltenEmbersDamageSources[spell.id] = { amount: 0, spell };
    }
    this.hasReverberations = this.selectedCombatant.hasTalent(TALENTS.REVERBERATIONS_TALENT);
  }

  onDamage(event: DamageEvent) {
    // Calculate Reverberations on Cast since it is snapshot
    if (event.ability.guid === SPELLS.UPHEAVAL_DOT.id) {
      return;
    }

    const enemy = this.enemies.getEntity(event);

    if (!enemy || !enemy.getBuff(SPELLS.FIRE_BREATH_DOT.id)) {
      return;
    }

    const effAmount = calculateEffectiveDamage(event, MOLTEN_EMBERS_MULTIPLIER);

    this.moltenEmbersDamageSources[event.ability.guid].amount += effAmount;
    this.totalMoltenEmbersDamage += effAmount;
  }

  onFireBreathCast(event: EmpowerEndEvent) {
    this.previousFireBreathRank = event.empowermentLevel;
  }

  onUpheavalCast(event: EmpowerEndEvent) {
    const damageEvents = GetRelatedEvents(event, UPHEAVAL_CAST_DAM_LINK);
    const fireBreathActive = damageEvents.some((e) => {
      const enemy = this.enemies.getEntity(e);
      return enemy && enemy.getBuff(SPELLS.FIRE_BREATH_DOT.id);
    });

    if (this.hasReverberations && fireBreathActive) {
      const reverbEvents = GetRelatedEvents<DamageEvent>(event, UPHEAVAL_REVERBERATION_DAM_LINK);

      reverbEvents.forEach((reverbEvent) => {
        const effAmount = calculateEffectiveDamage(reverbEvent, MOLTEN_EMBERS_MULTIPLIER);

        this.moltenEmbersDamageSources[SPELLS.UPHEAVAL_DAM.id].amount += effAmount;
        this.totalMoltenEmbersDamage += effAmount;
      });
    }

    this.upheavalCasts.push({
      event,
      fireBreathActive,
      fireBreathRank: this.previousFireBreathRank,
    });
  }

  private finalize() {
    // finalize performances
    this.uses = this.upheavalCasts.map((upheavalCast) => this.upheavalUsage(upheavalCast));
  }

  private upheavalUsage(upheavalCast: UpheavalCast): SpellUse {
    const fireBreathActivePerformance = this.getFireBreathActivePerformance(upheavalCast);

    const checklistItems: ChecklistUsageInfo[] = [
      {
        check: 'upheaval-molten-embers-dot-active',
        timestamp: upheavalCast.event.timestamp,
        ...fireBreathActivePerformance,
      },
    ];

    if (fireBreathActivePerformance.performance === QualitativePerformance.Perfect) {
      const fireBreathRankPerformance = this.getFireBreathRankPerformance(upheavalCast);
      checklistItems.push({
        check: 'upheaval-molten-embers-dot-rank',
        timestamp: upheavalCast.event.timestamp,
        ...fireBreathRankPerformance,
      });
    }

    const actualPerformance = combineQualitativePerformances(
      checklistItems.map((item) => item.performance),
    );

    return {
      event: upheavalCast.event,
      performance: actualPerformance,
      checklistItems,
      performanceExplanation:
        actualPerformance !== QualitativePerformance.Fail
          ? `${actualPerformance} Usage`
          : 'Bad Usage',
    };
  }

  private getFireBreathRankPerformance(upheavalCast: UpheavalCast) {
    const summary = (
      <div>
        <SpellLink spell={SPELLS.FIRE_BREATH} /> downranked
      </div>
    );
    if (this.perfectFireBreathRank === upheavalCast.fireBreathRank) {
      return {
        performance: QualitativePerformance.Perfect,
        summary: summary,
        details: (
          <div>
            <SpellLink spell={SPELLS.FIRE_BREATH} /> cast at rank 1. Good job!
          </div>
        ),
      };
    }

    return {
      performance: QualitativePerformance.Good,
      summary: summary,
      details: (
        <div>
          <SpellLink spell={SPELLS.FIRE_BREATH} /> cast at rank {upheavalCast.fireBreathRank}. You
          should usually cast <SpellLink spell={SPELLS.FIRE_BREATH} /> at rank 1 to maximise{' '}
          <SpellLink spell={TALENTS.MOLTEN_EMBERS_TALENT} /> uptime.
        </div>
      ),
    };
  }

  private getFireBreathActivePerformance(upheavalCast: UpheavalCast) {
    const summary = (
      <div>
        <SpellLink spell={SPELLS.FIRE_BREATH} /> DoT active
      </div>
    );
    if (upheavalCast.fireBreathActive) {
      return {
        performance: QualitativePerformance.Perfect,
        summary: summary,
        details: (
          <div>
            <SpellLink spell={SPELLS.FIRE_BREATH} /> DoT active. Good job!
          </div>
        ),
      };
    }

    return {
      performance: QualitativePerformance.Fail,
      summary: summary,
      details: (
        <div>
          <SpellLink spell={SPELLS.FIRE_BREATH} /> DoT wasn't active. You should try to have{' '}
          <SpellLink spell={SPELLS.FIRE_BREATH} /> when you cast{' '}
          <SpellLink spell={SPELLS.UPHEAVAL} />.
        </div>
      ),
    };
  }

  guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }

    const explanation = (
      <section>
        <strong>
          <SpellLink spell={TALENTS.MOLTEN_EMBERS_TALENT} />
        </strong>{' '}
        amplifies the damage of your Black Spells such as <SpellLink spell={SPELLS.UPHEAVAL} />{' '}
        while <SpellLink spell={SPELLS.FIRE_BREATH} /> is active on the target. You should try to
        use <SpellLink spell={SPELLS.FIRE_BREATH} /> at rank 1, and always ensure it is active when
        you cast <SpellLink spell={SPELLS.UPHEAVAL} /> on a target.
      </section>
    );

    return (
      <ContextualSpellUsageSubSection
        title="Molten Embers"
        explanation={explanation}
        uses={this.uses}
        castBreakdownSmallText={
          <> - These boxes represent each cast, colored by how good the usage was.</>
        }
        abovePerformanceDetails={<div style={{ marginBottom: 10 }}></div>}
      />
    );
  }

  statistic() {
    const damageItems = Object.values(this.moltenEmbersDamageSources)
      .filter((source) => source.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .map((source, idx) => ({
        color: COLORS[idx] || COLORS[COLORS.length - 1],
        label: source.spell.name,
        spellId: source.spell.id,
        valueTooltip: formatNumber(source.amount),
        value: source.amount,
      }));

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.totalMoltenEmbersDamage)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.MOLTEN_EMBERS_TALENT}>
          <ItemDamageDone amount={this.totalMoltenEmbersDamage} />
        </TalentSpellText>
        <div className="pad">
          <label>Damage sources</label>
          <DonutChart items={damageItems} />
        </div>
      </Statistic>
    );
  }
}

export default MoltenEmbers;
