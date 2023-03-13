import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import {
  getBuffedCasts,
  getPreviousVengefulRetreat,
} from '../../normalizers/EssenceBreakNormalizer';
import { Expandable, SpellLink } from 'interface';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { Trans } from '@lingui/macro';
import InitiativeExplanation from 'analysis/retail/demonhunter/havoc/guide/InitiativeExplanation';
import DemonicExplanation from 'analysis/retail/demonhunter/havoc/guide/DemonicExplanation';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { ReactNode } from 'react';
import NoDemonicExplanation from 'analysis/retail/demonhunter/havoc/guide/NoDemonicExplanation';
import { ChecklistUsageInfo, SpellUse, UsageInfo } from 'parser/core/SpellUsage/core';
import MajorCooldown, { SpellCast } from 'parser/core/MajorCooldowns/MajorCooldown';
import { ExplanationSection } from 'analysis/retail/demonhunter/shared/guide/CommonComponents';
import { SectionHeader } from 'interface/guide';

/*
  example report: https://www.warcraftlogs.com/reports/8gAWrDqPhVj6BZkQ/#fight=29&source=7
 */

interface EssenceBreakCooldownCast extends SpellCast {
  buffedCasts: number;
  deathSweepCasts: number;
  annihilationCasts: number;
  bladeDanceCasts: number;
  chaosStrikeCasts: number;
  hasInitiativeOnCast: boolean;
  hasMetamorphosisOnCast: boolean;
  metamorphosisAvailable: boolean;
}

const DAMAGE_SPELLS = [
  SPELLS.CHAOS_STRIKE_MH_DAMAGE,
  SPELLS.CHAOS_STRIKE_OH_DAMAGE,
  SPELLS.ANNIHILATION_MH_DAMAGE,
  SPELLS.ANNIHILATION_OH_DAMAGE,
  SPELLS.BLADE_DANCE_DAMAGE,
  SPELLS.BLADE_DANCE_DAMAGE_LAST_HIT,
  SPELLS.DEATH_SWEEP_DAMAGE,
  SPELLS.DEATH_SWEEP_DAMAGE_LAST_HIT,
];
const DAMAGE_INCREASE = 0.4;

class EssenceBreak extends MajorCooldown<EssenceBreakCooldownCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    enemies: Enemies,
    spellUsable: SpellUsable,
  };

  protected enemies!: Enemies;
  protected spellUsable!: SpellUsable;
  private extraDamage = 0;
  private talentDamage = 0;

  constructor(options: Options) {
    super({ spell: TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT }, options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(DAMAGE_SPELLS),
      this.onBuffedSpellDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT),
      this.onEssBDamage,
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.casts.filter((cast) => cast.buffedCasts < 2).length,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual) =>
      suggest(
        <>
          Try to fit at least 2 casts of <SpellLink id={SPELLS.CHAOS_STRIKE.id} /> /{' '}
          <SpellLink id={SPELLS.ANNIHILATION.id} />
          /
          <SpellLink id={SPELLS.BLADE_DANCE.id} /> / <SpellLink id={SPELLS.DEATH_SWEEP.id} /> during
          your <SpellLink id={TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT.id} /> window.
        </>,
      )
        .icon(TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT.icon)
        .actual(
          <>
            {actual} bad <SpellLink id={TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT.id} /> casts.
          </>,
        )
        .recommended('No bad casts is recommended.'),
    );
  }

  statistic() {
    const totalDamage = this.extraDamage + this.talentDamage;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(6)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            {formatThousands(this.talentDamage)} talent damage
            <br />
            {formatThousands(this.extraDamage)} damage added to Chaos Strike/Annihilation/Blade
            Dance/Death Sweep
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT}>
          <ItemDamageDone amount={totalDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }

  description(): ReactNode {
    const hasDemonic = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.DEMONIC_TALENT);
    const hasInitiative = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.INITIATIVE_TALENT);
    const hasInnerDemon = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.INNER_DEMON_TALENT);

    return (
      <>
        <ExplanationSection>
          <p>
            <Trans id="guide.demonhunter.havoc.sections.cooldowns.essenceBreak.explanation">
              <strong>
                <SpellLink id={TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT} />
              </strong>{' '}
              is a powerful burst of damage that also amplifies the damage done by{' '}
              <SpellLink id={SPELLS.CHAOS_STRIKE} />, <SpellLink id={SPELLS.ANNIHILATION} />,{' '}
              <SpellLink id={SPELLS.BLADE_DANCE} />, and <SpellLink id={SPELLS.DEATH_SWEEP} />. You
              want to fit as many empowered casts into each Essence Break window as you can.
            </Trans>
          </p>
        </ExplanationSection>
        <ExplanationSection>
          <NoDemonicExplanation />
          <DemonicExplanation />
          <InitiativeExplanation />
        </ExplanationSection>
        <Expandable
          header={
            <SectionHeader>
              <strong>
                When <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC} /> is available
              </strong>
            </SectionHeader>
          }
          element="section"
        >
          <div>
            An <SpellLink id={TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT} /> window with{' '}
            <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC} /> available will look like:
            <ul>
              {hasDemonic && (
                <li>
                  <SpellLink id={TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT} />
                </li>
              )}
              {hasInitiative && (
                <li>
                  <SpellLink id={TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT} />
                </li>
              )}
              {hasInnerDemon && (
                <li>
                  <SpellLink id={SPELLS.ANNIHILATION} />
                </li>
              )}
              <li>
                <SpellLink id={TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT} />
              </li>
              <li>
                <SpellLink id={SPELLS.DEATH_SWEEP} />
              </li>
              <li>
                <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC} />
              </li>
              <li>
                <SpellLink id={SPELLS.DEATH_SWEEP} />
              </li>
            </ul>
          </div>
        </Expandable>
        <Expandable
          header={
            <SectionHeader>
              <strong>Standard</strong>
            </SectionHeader>
          }
          element="section"
        >
          <div>
            An <SpellLink id={TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT} /> window without{' '}
            <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC} /> available will look like:
            <ul>
              {hasDemonic && (
                <li>
                  <SpellLink id={TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT} />
                </li>
              )}
              {hasInitiative && (
                <li>
                  <SpellLink id={TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT} />
                </li>
              )}
              <li>
                <SpellLink id={TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT} />
              </li>
              <li>
                <SpellLink id={SPELLS.DEATH_SWEEP} />
              </li>
              <li>
                <SpellLink id={SPELLS.ANNIHILATION} />
              </li>
              <li>
                <SpellLink id={SPELLS.ANNIHILATION} />
              </li>
            </ul>
          </div>
        </Expandable>
      </>
    );
  }

  explainPerformance(cast: EssenceBreakCooldownCast): SpellUse {
    if (!this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.DEMONIC_TALENT)) {
      return {
        event: cast.event,
        performance: QualitativePerformance.Fail,
        performanceExplanation: 'Bad Usage',
        checklistItems: [
          {
            check: 'demonic',
            performance: QualitativePerformance.Fail,
            timestamp: cast.event.timestamp,
            summary: (
              <div>
                Did not have <SpellLink id={TALENTS_DEMON_HUNTER.DEMONIC_TALENT} /> talented
              </div>
            ),
            details: (
              <div>
                Did not have <SpellLink id={TALENTS_DEMON_HUNTER.DEMONIC_TALENT} /> talented. In
                order to get the maximum amount of damage possible out of Essence Break, you should
                use <SpellLink id={TALENTS_DEMON_HUNTER.DEMONIC_TALENT} />.
              </div>
            ),
          },
        ],
      };
    }

    const inMetamorphosisPerformance = this.inMetamorphosisOnCastPerformance(cast);
    const initiativePerformance = this.initiativePerformance(cast);
    const essbWindowCastPerformance = this.essbWindowCastPerformance(cast);

    const checklistItems: ChecklistUsageInfo[] = [
      { check: 'in-metamorphosis', timestamp: cast.event.timestamp, ...inMetamorphosisPerformance },
      {
        check: 'buffed-casts',
        timestamp: cast.event.timestamp,
        ...essbWindowCastPerformance,
      },
    ];
    if (initiativePerformance) {
      checklistItems.push({
        check: 'initiative',
        timestamp: cast.event.timestamp,
        ...initiativePerformance,
      });
    }

    const actualPerformance = combineQualitativePerformances(
      checklistItems.map((item) => item.performance),
    );
    return {
      event: cast.event,
      checklistItems: checklistItems,
      performance: actualPerformance,
      performanceExplanation:
        actualPerformance !== QualitativePerformance.Fail
          ? `${actualPerformance} Usage`
          : 'Bad Usage',
    };
  }

  private inMetamorphosisOnCastPerformance(cast: EssenceBreakCooldownCast): UsageInfo {
    const summary = (
      <div>
        Have <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC_BUFF} /> on cast
      </div>
    );

    if (!cast.hasMetamorphosisOnCast) {
      return {
        performance: QualitativePerformance.Fail,
        summary: summary,
        details: (
          <div>
            Have <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC_BUFF} /> on cast. Not having the buff
            means that you can't cast <SpellLink id={SPELLS.DEATH_SWEEP} /> or{' '}
            <SpellLink id={SPELLS.ANNIHILATION} />, instead having to cast{' '}
            <SpellLink id={SPELLS.BLADE_DANCE} /> and <SpellLink id={SPELLS.CHAOS_STRIKE} />.
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Perfect,
      summary: summary,
      details: (
        <div>
          You were in <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC_BUFF} /> when you cast{' '}
          <SpellLink id={TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT} />. Good job!
        </div>
      ),
    };
  }

  private initiativePerformance(cast: EssenceBreakCooldownCast): UsageInfo | undefined {
    if (!this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.INITIATIVE_TALENT)) {
      return undefined;
    }

    const summary = (
      <div>
        Had <SpellLink id={TALENTS_DEMON_HUNTER.INITIATIVE_TALENT} /> buff
      </div>
    );

    const previousVengefulRetreat = getPreviousVengefulRetreat(cast.event);
    if (cast.hasInitiativeOnCast) {
      return {
        performance: QualitativePerformance.Perfect,
        summary: summary,
        details: (
          <div>
            Had <SpellLink id={TALENTS_DEMON_HUNTER.INITIATIVE_TALENT} /> buff.
          </div>
        ),
      };
    }
    if (previousVengefulRetreat) {
      return {
        performance: QualitativePerformance.Good,
        summary: summary,
        details: (
          <div>
            Cast shortly after casting{' '}
            <SpellLink id={TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT} />. You might have been
            damaged and lost your <SpellLink id={TALENTS_DEMON_HUNTER.INITIATIVE_TALENT} /> buff,
            but that's okay, you still did your rotation correctly.
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Fail,
      summary: summary,
      details: (
        <div>
          Cast without previously casting{' '}
          <SpellLink id={TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT} />. Try casting{' '}
          <SpellLink id={TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT} /> before casting for the
          critical strike chance buff that it applies (courtesy of{' '}
          <SpellLink id={TALENTS_DEMON_HUNTER.INITIATIVE_TALENT} />
          ).
        </div>
      ),
    };
  }

  private essbWindowCastPerformance(cast: EssenceBreakCooldownCast): UsageInfo {
    const maximumNumberOfDeathSweepsPossible =
      (cast.hasMetamorphosisOnCast ? 1 : 0) + (cast.metamorphosisAvailable ? 1 : 0);
    const nonDeathSweepBuffedCasts = Math.max(0, cast.buffedCasts - cast.deathSweepCasts);

    const maxDeathSweepsSummary = (
      <div>
        Cast {maximumNumberOfDeathSweepsPossible}+ <SpellLink id={SPELLS.DEATH_SWEEP} />
        (s) during window
      </div>
    );

    // if meta is available and we've cast EssB, the sequence should be
    // EssB -> DS -> Meta -> DS
    if (cast.metamorphosisAvailable) {
      if (cast.deathSweepCasts >= maximumNumberOfDeathSweepsPossible) {
        return {
          performance: QualitativePerformance.Perfect,
          summary: maxDeathSweepsSummary,
          details: (
            <div>
              You cast {cast.deathSweepCasts} <SpellLink id={SPELLS.DEATH_SWEEP} />
              (s).
            </div>
          ),
        };
      }
      return {
        performance:
          cast.deathSweepCasts > 0 ? QualitativePerformance.Ok : QualitativePerformance.Fail,
        summary: maxDeathSweepsSummary,
        details: (
          <div>
            You cast {cast.deathSweepCasts} <SpellLink id={SPELLS.DEATH_SWEEP} />
            (s) when you could have cast {maximumNumberOfDeathSweepsPossible} by pressing{' '}
            <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC} />.
          </div>
        ),
      };
    }

    // meta isn't available and we've cast EssB, the sequence should be
    // EssB -> DS -> Anni -> Anni
    if (cast.deathSweepCasts === 0) {
      return {
        performance: QualitativePerformance.Fail,
        summary: maxDeathSweepsSummary,
        details: (
          <div>
            You cast {cast.deathSweepCasts} <SpellLink id={SPELLS.DEATH_SWEEP} />
            (s). Always try to cast <SpellLink id={SPELLS.DEATH_SWEEP} /> during your{' '}
            <SpellLink id={TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT} /> window.
          </div>
        ),
      };
    }
    // means we have at least 1 cast of DS, so we should check if we have other buffed casts
    if (nonDeathSweepBuffedCasts === 0) {
      return {
        performance: QualitativePerformance.Ok,
        summary: maxDeathSweepsSummary,
        details: (
          <div>
            You cast {cast.deathSweepCasts} <SpellLink id={SPELLS.DEATH_SWEEP} /> and no other
            buffed spells. Try adding another <SpellLink id={SPELLS.ANNIHILATION} /> or{' '}
            <SpellLink id={SPELLS.CHAOS_STRIKE} /> inside your{' '}
            <SpellLink id={TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT} /> window.
          </div>
        ),
      };
    }
    if (nonDeathSweepBuffedCasts === 1) {
      return {
        performance: QualitativePerformance.Good,
        summary: maxDeathSweepsSummary,
        details: (
          <div>
            You cast {cast.deathSweepCasts} <SpellLink id={SPELLS.DEATH_SWEEP} />,{' '}
            {cast.bladeDanceCasts} <SpellLink id={SPELLS.BLADE_DANCE} />, {cast.annihilationCasts}{' '}
            <SpellLink id={SPELLS.ANNIHILATION} />, and {cast.chaosStrikeCasts}{' '}
            <SpellLink id={SPELLS.CHAOS_STRIKE} />. Try adding another{' '}
            <SpellLink id={SPELLS.ANNIHILATION} /> or <SpellLink id={SPELLS.CHAOS_STRIKE} /> inside
            your <SpellLink id={TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT} /> window.
          </div>
        ),
      };
    }
    return {
      performance:
        nonDeathSweepBuffedCasts > 1 ? QualitativePerformance.Perfect : QualitativePerformance.Good,
      summary: maxDeathSweepsSummary,
      details: (
        <div>
          You cast {cast.deathSweepCasts} <SpellLink id={SPELLS.DEATH_SWEEP} /> and{' '}
          {nonDeathSweepBuffedCasts} other buffed spell(s).
        </div>
      ),
    };
  }

  private onCast(event: CastEvent) {
    this.recordCooldown({
      event,
      buffedCasts: getBuffedCasts(event).length,
      deathSweepCasts: getBuffedCasts(event).filter(
        (it) => it.ability.guid === SPELLS.DEATH_SWEEP.id,
      ).length,
      bladeDanceCasts: getBuffedCasts(event).filter(
        (it) => it.ability.guid === SPELLS.BLADE_DANCE.id,
      ).length,
      annihilationCasts: getBuffedCasts(event).filter(
        (it) => it.ability.guid === SPELLS.ANNIHILATION.id,
      ).length,
      chaosStrikeCasts: getBuffedCasts(event).filter(
        (it) => it.ability.guid === SPELLS.CHAOS_STRIKE.id,
      ).length,
      hasInitiativeOnCast: this.selectedCombatant.hasBuff(
        SPELLS.INITIATIVE_BUFF.id,
        event.timestamp,
      ),
      hasMetamorphosisOnCast: this.selectedCombatant.hasBuff(
        SPELLS.METAMORPHOSIS_HAVOC_BUFF.id,
        event.timestamp,
      ),
      metamorphosisAvailable: this.spellUsable.isAvailable(SPELLS.METAMORPHOSIS_HAVOC.id),
    });
  }

  private onBuffedSpellDamage(event: DamageEvent) {
    const target = this.enemies.getEntity(event);
    if (!target) {
      return;
    }
    const hasEssenceBreakDebuff = target.hasBuff(SPELLS.ESSENCE_BREAK_DAMAGE.id, event.timestamp);

    if (hasEssenceBreakDebuff) {
      this.extraDamage += calculateEffectiveDamage(event, DAMAGE_INCREASE);
    }
  }

  private onEssBDamage(event: DamageEvent) {
    this.talentDamage += event.amount;
  }
}

export default EssenceBreak;
