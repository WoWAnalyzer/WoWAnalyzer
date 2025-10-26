import type { JSX } from 'react';
import {
  ENGULF_CONSUME_FLAME,
  IRIDESCENCE_RED_CONSUME,
} from 'analysis/retail/evoker/devastation/modules/normalizers/CastLinkNormalizer';
import {
  ENGULF_PERIODIC_INCREASE,
  PERIODIC_DAMAGE_IDS,
  PERIODIC_HEALING_IDS,
} from 'analysis/retail/evoker/shared/constants';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import SPECS from 'game/SPECS';
import SpellLink from 'interface/SpellLink';
import { TooltipElement } from 'interface/Tooltip';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import Enemy from 'parser/core/Enemy';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, {
  CastEvent,
  DamageEvent,
  GetRelatedEvents,
  HasRelatedEvent,
  HealEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/EventSubscriber';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import ContextualSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import Combatants from 'parser/shared/modules/Combatants';
import Enemies from 'parser/shared/modules/Enemies';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

interface EngulfCast {
  event: CastEvent;
  fireBreathActiveOnCast: boolean;
  fireBreathActiveAfterConsume: boolean;
  rubyEmbersActive: boolean;
  enkindleActive: boolean;
  shatteringStarActive: boolean;
  iridescenceConsumed: boolean;
  consumeFlameTargetCount: number;
  castOnFriendly?: string;
  castOnUnknown?: boolean;
}

class Engulf extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  private uses: SpellUse[] = [];
  private engulfCasts: EngulfCast[] = [];

  hasIridescence = false;
  hasRubyEmbers = false;
  hasEnkindle = false;
  hasShatteringStar = false;
  hasScorchingEmbers = false;
  currentEngulfTarget: Enemy | undefined;

  damagePeriodicCounts: number[] = [];
  healingPeriodicCounts: number[] = [];
  totalDamage = 0;
  totalHealing = 0;
  damageFromInc = 0;
  healingFromInc = 0;
  protected combatants!: Combatants;
  protected enemies!: Enemies;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.ENGULF_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ENGULF_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ENGULF_HEAL), this.onHeal);

    if (this.selectedCombatant.spec === SPECS.DEVASTATION_EVOKER) {
      this.hasIridescence = this.selectedCombatant.hasTalent(TALENTS_EVOKER.IRIDESCENCE_TALENT);
      this.hasRubyEmbers = this.selectedCombatant.hasTalent(TALENTS_EVOKER.RUBY_EMBERS_TALENT);
      this.hasEnkindle = this.selectedCombatant.hasTalent(TALENTS_EVOKER.ENKINDLE_TALENT);
      this.hasShatteringStar = this.selectedCombatant.hasTalent(
        TALENTS_EVOKER.SHATTERING_STAR_TALENT,
      );
      this.hasScorchingEmbers = this.selectedCombatant.hasTalent(
        TALENTS_EVOKER.SCORCHING_EMBERS_TALENT,
      );

      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.ENGULF_TALENT),
        this.onCast,
      );
      this.addEventListener(Events.fightend, this.finalize);
    }
  }

  getNumPeriodicEffects(target: Combatant | Enemy) {
    const arrRef: number[] = target instanceof Enemy ? PERIODIC_DAMAGE_IDS : PERIODIC_HEALING_IDS;
    return arrRef
      .map((id) => target.hasBuff(id))
      .reduce((prev, hasBuff) => prev + (hasBuff ? 1 : 0), 0);
  }

  onDamage(event: DamageEvent) {
    this.totalDamage += event.amount + (event.absorbed || 0);
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    const numPeriodics = this.getNumPeriodicEffects(enemy);
    this.damagePeriodicCounts.push(numPeriodics);
    this.damageFromInc += calculateEffectiveDamage(event, ENGULF_PERIODIC_INCREASE * numPeriodics);

    if (
      this.currentEngulfTarget === enemy &&
      this.engulfCasts.length &&
      !this.engulfCasts[this.engulfCasts.length - 1].castOnUnknown &&
      !this.engulfCasts[this.engulfCasts.length - 1].castOnFriendly
    ) {
      this.engulfCasts[this.engulfCasts.length - 1].fireBreathActiveAfterConsume =
        this.currentEngulfTarget.hasBuff(SPELLS.FIRE_BREATH_DOT);
      /* console.log(
        this.owner.formatTimestamp(event.timestamp, 3),
        this.currentEngulfTarget.name,
        this.currentEngulfTarget.hasBuff(SPELLS.FIRE_BREATH_DOT),
      ); */
      this.currentEngulfTarget = undefined;
    }
  }

  onHeal(event: HealEvent) {
    this.totalHealing += event.amount + (event.absorbed || 0);
    const target = this.combatants.getEntity(event);
    if (!target) {
      return;
    }
    const numPeriodics = this.getNumPeriodicEffects(target);
    this.healingPeriodicCounts.push(numPeriodics);
    this.healingFromInc += calculateEffectiveHealing(
      event,
      ENGULF_PERIODIC_INCREASE * numPeriodics,
    );
  }

  onCast(event: CastEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      const friendlyTarget = this.combatants.getEntity(event);
      if (friendlyTarget) {
        this.engulfCasts.push({
          event,
          fireBreathActiveOnCast: false,
          fireBreathActiveAfterConsume: false,
          rubyEmbersActive: false,
          enkindleActive: false,
          shatteringStarActive: false,
          iridescenceConsumed: false,
          consumeFlameTargetCount: 0,
          castOnFriendly: friendlyTarget.name,
        });
      } else {
        this.engulfCasts.push({
          event,
          fireBreathActiveOnCast: false,
          fireBreathActiveAfterConsume: false,
          rubyEmbersActive: false,
          enkindleActive: false,
          shatteringStarActive: false,
          iridescenceConsumed: false,
          consumeFlameTargetCount: 0,
          castOnUnknown: true,
        });
        //console.log('No target found!', this.owner.formatTimestamp(event.timestamp, 3), event);
      }

      this.currentEngulfTarget = undefined;
      return;
    }

    /** When playing Scorching Embers, FB needs to be up
     * post consume for Consume Flame to benefit from the damage amplification.
     * But due to how buff tracking is done, we need make the future
     * hasBuff check on the damage event */
    if (this.hasScorchingEmbers) {
      this.currentEngulfTarget = enemy;
    }

    this.engulfCasts.push({
      event,
      fireBreathActiveOnCast: enemy.hasBuff(SPELLS.FIRE_BREATH_DOT),
      fireBreathActiveAfterConsume: false,
      rubyEmbersActive: enemy.hasBuff(SPELLS.LIVING_FLAME_DAMAGE),
      enkindleActive: enemy.hasBuff(SPELLS.ENKINDLE_DOT),
      shatteringStarActive: enemy.hasBuff(TALENTS_EVOKER.SHATTERING_STAR_TALENT),
      iridescenceConsumed: HasRelatedEvent(event, IRIDESCENCE_RED_CONSUME),
      consumeFlameTargetCount: GetRelatedEvents(event, ENGULF_CONSUME_FLAME).length,
    });
  }

  private finalize() {
    // finalize performances
    this.uses = this.engulfCasts.map((engulfCast) => this.engulfUsage(engulfCast));
  }

  private engulfUsage(engulfCast: EngulfCast): SpellUse {
    const checklistItems: ChecklistUsageInfo[] = [];

    const targetPerformance = this.getTargetPerformance(engulfCast);
    if (targetPerformance) {
      checklistItems.push({
        check: 'engulf-target-performance',
        timestamp: engulfCast.event.timestamp,
        ...targetPerformance,
      });

      return {
        event: engulfCast.event,
        performance: QualitativePerformance.Ok,
        checklistItems,
        performanceExplanation: 'Ok Usage',
      };
    }

    const fireBreathPerformance = this.getFireBreathPerformance(engulfCast);
    checklistItems.push({
      check: 'engulf-fire-breath-active-performance',
      timestamp: engulfCast.event.timestamp,
      ...fireBreathPerformance,
    });

    if (!engulfCast.fireBreathActiveOnCast) {
      return {
        event: engulfCast.event,
        performance: QualitativePerformance.Fail,
        checklistItems,
        performanceExplanation: 'Bad Usage',
      };
    }

    if (this.hasIridescence) {
      const iridescencePerformance = this.getIridescencePerformance(engulfCast);
      checklistItems.push({
        check: 'engulf-iridescence-consume-performance',
        timestamp: engulfCast.event.timestamp,
        ...iridescencePerformance,
      });
    }

    if (this.hasRubyEmbers) {
      const rubyEmbersPerformance = this.getRubyEmbersPerformance(engulfCast);
      checklistItems.push({
        check: 'engulf-ruby-embers-active-performance',
        timestamp: engulfCast.event.timestamp,
        ...rubyEmbersPerformance,
      });
    }

    if (this.hasEnkindle) {
      const enkindlePerformance = this.getEnkindlePerformance(engulfCast);
      checklistItems.push({
        check: 'engulf-enkindle-active-performance',
        timestamp: engulfCast.event.timestamp,
        ...enkindlePerformance,
      });
    }

    if (this.hasShatteringStar) {
      const shatteringStarPerformance = this.getShatteringStarPerformance(engulfCast);
      checklistItems.push({
        check: 'engulf-shattering-star-active-performance',
        timestamp: engulfCast.event.timestamp,
        ...shatteringStarPerformance,
      });
    }

    /**
     * NOTE: This is disabled for now, since you don't really play around it in ST
     * And for AoE, anything but your main target should be have FB up anyways
     * Leaving it here commented out since it might be useful in the future
     * The APL is currently changing way too rapidly... */
    /* if (this.hasScorchingEmbers) {
      const scorchingEmbersPerformance = this.getScorchingEmbersPerformance(engulfCast);
      checklistItems.push({
        check: 'engulf-scorching-embers-performance',
        timestamp: engulfCast.event.timestamp,
        ...scorchingEmbersPerformance,
      });
    } */

    const consumeFlameTargetCountPerformance =
      this.getConsumeFlameTargetCountPerformance(engulfCast);
    if (consumeFlameTargetCountPerformance) {
      checklistItems.push({
        check: 'engulf-consume-flame-targets-performance',
        timestamp: engulfCast.event.timestamp,
        ...consumeFlameTargetCountPerformance,
      });
    }

    /* Mark the usage as Perfect if all the checks are good
     * This makes it easier to rate good uses for AoE
     * Since we don't really care about anything but FB for AoE
     * But still marking it as perfect when they are up for prio damage */
    const actualPerformance = checklistItems.every(
      (item) => item.performance === QualitativePerformance.Good,
    )
      ? QualitativePerformance.Perfect
      : consumeFlameTargetCountPerformance
        ? QualitativePerformance.Good
        : combineQualitativePerformances(checklistItems.map((item) => item.performance));

    return {
      event: engulfCast.event,
      performance: actualPerformance,
      checklistItems,
      performanceExplanation:
        actualPerformance !== QualitativePerformance.Fail
          ? `${actualPerformance} Usage`
          : 'Bad Usage',
    };
  }

  private getConsumeFlameTargetCountPerformance(engulfCast: EngulfCast) {
    if (engulfCast.consumeFlameTargetCount <= 1) {
      return;
    }

    return {
      performance: QualitativePerformance.Good,
      summary: (
        <>
          <SpellLink spell={TALENTS_EVOKER.CONSUME_FLAME_TALENT} /> hit{' '}
          {engulfCast.consumeFlameTargetCount} targets
        </>
      ),
      details: (
        <div key="engulf-consume-flame-targets">
          <SpellLink spell={TALENTS_EVOKER.CONSUME_FLAME_TALENT} /> hit{' '}
          {engulfCast.consumeFlameTargetCount} targets!
        </div>
      ),
    };
  }

  private getTargetPerformance(engulfCast: EngulfCast) {
    if (engulfCast.castOnFriendly) {
      return {
        performance: QualitativePerformance.Fail,
        summary: <>Cast hit a friendly target</>,
        details: (
          <div key="engulf-friendly-target">
            <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT} /> was cast on friendly target:{' '}
            {engulfCast.castOnFriendly}!
          </div>
        ),
      };
    } else if (engulfCast.castOnUnknown) {
      return {
        performance: QualitativePerformance.Ok,
        summary: <>Cast hit an unknown target</>,
        details: (
          <div key="engulf-unknown-target">
            <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT} /> was cast on an unknown target, and
            can not be evaluated.
          </div>
        ),
      };
    }
  }

  private getFireBreathPerformance(engulfCast: EngulfCast) {
    const summary = (
      <>
        <SpellLink spell={SPELLS.FIRE_BREATH} /> DoT active
      </>
    );

    if (!engulfCast.fireBreathActiveOnCast) {
      return {
        performance: QualitativePerformance.Fail,
        summary,
        details: (
          <div key="engulf-fire-breath-active">
            <SpellLink spell={SPELLS.FIRE_BREATH} /> DoT wasn't active! You should <b>never</b> cast{' '}
            <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT} /> without{' '}
            <SpellLink spell={SPELLS.FIRE_BREATH} /> DoT active.
          </div>
        ),
      };
    }

    return {
      performance: QualitativePerformance.Good,
      summary,
      details: (
        <div key="engulf-fire-breath-active">
          <SpellLink spell={SPELLS.FIRE_BREATH} /> DoT was active! Good job!
        </div>
      ),
    };
  }

  private getIridescencePerformance(engulfCast: EngulfCast) {
    const summary = (
      <>
        <SpellLink spell={SPELLS.IRIDESCENCE_RED} /> consumed
      </>
    );

    if (!engulfCast.iridescenceConsumed) {
      return {
        performance: QualitativePerformance.Fail,
        summary,
        details: (
          <div key="engulf-iridescence-consume">
            <SpellLink spell={SPELLS.IRIDESCENCE_RED} /> wasn't consumed! It is important to always
            have <SpellLink spell={SPELLS.IRIDESCENCE_RED} /> up for each cast of{' '}
            <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT} />.
          </div>
        ),
      };
    }

    return {
      performance: QualitativePerformance.Good,
      summary,
      details: (
        <div key="engulf-iridescence-consume">
          <SpellLink spell={SPELLS.IRIDESCENCE_RED} /> was consumed! Good job!
        </div>
      ),
    };
  }

  private getRubyEmbersPerformance(engulfCast: EngulfCast) {
    const summary = (
      <>
        <SpellLink spell={SPELLS.LIVING_FLAME_DAMAGE} /> DoT active
      </>
    );
    if (!engulfCast.rubyEmbersActive) {
      return {
        performance: QualitativePerformance.Fail,
        summary,
        details: (
          <div key="engulf-ruby-embers-active">
            <SpellLink spell={SPELLS.LIVING_FLAME_DAMAGE} /> DoT wasn't active! When playing{' '}
            <SpellLink spell={TALENTS_EVOKER.RUBY_EMBERS_TALENT} />, it is important to always
            ensure that <SpellLink spell={SPELLS.LIVING_FLAME_DAMAGE} /> DoT is active before
            casting <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT} />.
          </div>
        ),
      };
    }

    return {
      performance: QualitativePerformance.Good,
      summary,
      details: (
        <div key="engulf-ruby-embers-active">
          <SpellLink spell={SPELLS.LIVING_FLAME_DAMAGE} /> DoT was active! Good job!
        </div>
      ),
    };
  }

  private getEnkindlePerformance(engulfCast: EngulfCast) {
    const summary = (
      <>
        <SpellLink spell={SPELLS.ENKINDLE_DOT} /> DoT active
      </>
    );
    if (!engulfCast.enkindleActive) {
      return {
        performance: QualitativePerformance.Fail,
        summary,
        details: (
          <div key="engulf-enkindle-active">
            <SpellLink spell={SPELLS.ENKINDLE_DOT} /> DoT wasn't active! It is important to always
            ensure that <SpellLink spell={SPELLS.ENKINDLE_DOT} /> DoT is active before casting{' '}
            <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT} />.
          </div>
        ),
      };
    }

    return {
      performance: QualitativePerformance.Good,
      summary,
      details: (
        <div key="engulf-enkindle-active">
          <SpellLink spell={SPELLS.ENKINDLE_DOT} /> DoT was active! Good job!
        </div>
      ),
    };
  }

  private getShatteringStarPerformance(engulfCast: EngulfCast) {
    const summary = (
      <>
        <SpellLink spell={SPELLS.SHATTERING_STAR} /> active
      </>
    );
    if (!engulfCast.shatteringStarActive) {
      return {
        performance: QualitativePerformance.Ok,
        summary,
        details: (
          <div key="engulf-shattering-star-active">
            <SpellLink spell={SPELLS.SHATTERING_STAR} /> wasn't active! This is situationally
            correct, but ideally you should try and line up{' '}
            <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT} /> with{' '}
            <SpellLink spell={SPELLS.SHATTERING_STAR} /> when possible.
          </div>
        ),
      };
    }

    return {
      performance: QualitativePerformance.Good,
      summary,
      details: (
        <div key="engulf-shattering-star-active">
          <SpellLink spell={SPELLS.SHATTERING_STAR} /> was active! Good job!
        </div>
      ),
    };
  }

  private getScorchingEmbersPerformance(engulfCast: EngulfCast) {
    const summary = (
      <>
        <SpellLink spell={SPELLS.CONSUME_FLAME_DAMAGE} /> amplified by{' '}
        <SpellLink spell={TALENTS_EVOKER.SCORCHING_EMBERS_TALENT} />
      </>
    );
    if (!engulfCast.fireBreathActiveAfterConsume) {
      return {
        performance: QualitativePerformance.Ok,
        summary,
        details: (
          <div key="engulf-scorching-embers-fail">
            <SpellLink spell={SPELLS.FIRE_BREATH_DOT} /> DoT wasn't active for{' '}
            <SpellLink spell={SPELLS.CONSUME_FLAME_DAMAGE} />!{' '}
            <SpellLink spell={TALENTS_EVOKER.CONSUME_FLAME_TALENT} /> damage will only be amplified
            by <SpellLink spell={TALENTS_EVOKER.SCORCHING_EMBERS_TALENT} /> if there is still
            duration left on <SpellLink spell={SPELLS.FIRE_BREATH} /> after consumption.
          </div>
        ),
      };
    }

    return {
      performance: QualitativePerformance.Good,
      summary,
      details: (
        <div key="engulf-scorching-embers-good">
          <SpellLink spell={SPELLS.FIRE_BREATH_DOT} /> DoT was active for{' '}
          <SpellLink spell={SPELLS.CONSUME_FLAME_DAMAGE} />! Good job!
        </div>
      ),
    };
  }

  get averageHealPeriodics() {
    return (
      this.healingPeriodicCounts.reduce((prev, cur) => prev + cur, 0) /
      (this.healingPeriodicCounts.length || 1)
    );
  }

  get averageDamagePeriodics() {
    return (
      this.damagePeriodicCounts.reduce((prev, cur) => prev + cur, 0) /
      (this.damagePeriodicCounts.length || 1)
    );
  }

  guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }

    const explanation = (
      <section>
        <b>
          <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT} />
        </b>{' '}
        is a powerful burst damage ability that is amplified by each of your active DoTs on the
        target: <SpellLink spell={SPELLS.FIRE_BREATH_DOT} />,{' '}
        <SpellLink spell={SPELLS.ENKINDLE_DOT} /> and{' '}
        <SpellLink spell={TALENTS_EVOKER.RUBY_EMBERS_TALENT} />.
        {this.hasIridescence && (
          <>
            <br />
            <br />
            With <SpellLink spell={TALENTS_EVOKER.IRIDESCENCE_TALENT} /> talented{' '}
            <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT} /> should only be cast when it will
            consume <SpellLink spell={SPELLS.IRIDESCENCE_RED} />.
          </>
        )}
        {/* {this.hasScorchingEmbers && (
          <>
            <br />
            <br />
            With <SpellLink spell={TALENTS_EVOKER.SCORCHING_EMBERS_TALENT} /> talented it is
            important to note that <SpellLink spell={TALENTS_EVOKER.CONSUME_FLAME_TALENT} /> damage
            will only be amplified if there is still duration left on{' '}
            <SpellLink spell={SPELLS.FIRE_BREATH} /> after consumption. As such, you shouldn't cast{' '}
            <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT} /> with less than ~2.5 seconds left on{' '}
            <SpellLink spell={SPELLS.FIRE_BREATH} />.
          </>
        )} */}
        {this.owner.selectedCombatant.hasTalent(TALENTS_EVOKER.CONSUME_FLAME_TALENT) && (
          <>
            <br />
            <br />
            <b>Note:</b> <SpellLink spell={TALENTS_EVOKER.CONSUME_FLAME_TALENT} /> damage isn't
            amplified by your active DoTs. Instead, it only scales with{' '}
            <SpellLink spell={SPELLS.FIRE_BREATH_DOT} /> damage. Therefore, in AoE situations,
            having your DoTs or <SpellLink spell={SPELLS.SHATTERING_STAR} /> active will only
            increase damage on your main target.
          </>
        )}
      </section>
    );

    return (
      <ContextualSpellUsageSubSection
        title="Engulf"
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
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.ENGULF_TALENT}>
          <div>
            <TooltipElement
              content={
                <>
                  <div>Average Periodics: {this.averageHealPeriodics.toFixed(2)}</div>
                  <div>
                    % of healing from periodic increase:{' '}
                    {formatPercentage(this.healingFromInc / this.totalHealing)}%
                  </div>
                </>
              }
            >
              <ItemHealingDone amount={this.totalHealing} />
            </TooltipElement>
          </div>
          <div>
            <TooltipElement
              content={
                <>
                  <div>Average Periodics: {this.averageDamagePeriodics.toFixed(2)}</div>
                  <div>
                    % of damage from periodic increase:{' '}
                    {formatPercentage(this.damageFromInc / this.totalDamage)}%
                  </div>
                </>
              }
            >
              <ItemDamageDone amount={this.totalDamage} />
            </TooltipElement>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Engulf;
