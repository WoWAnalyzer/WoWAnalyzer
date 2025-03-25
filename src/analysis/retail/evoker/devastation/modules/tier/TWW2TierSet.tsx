import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EmpowerEndEvent, GetRelatedEvent, RemoveBuffEvent } from 'parser/core/Events';
import { TIERS } from 'game/TIERS';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import ContextualSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import SpellLink from 'interface/SpellLink';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { getConsumedJackpotStacks, JACKPOT_CONSUME } from '../normalizers/CastLinkNormalizer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
type JackpotConsume = {
  event: RemoveBuffEvent;
  stacks: number;
  remainingFireBreathCooldown: number;
  engulfChargesAvailable: number;
  empowerEvent?: EmpowerEndEvent;
};

const MIN_FB_CD_FOR_ES_CONSUME_MS = 10_000;

/**
 * (4) Set Devastation: Casting Shattering Star or hitting a Jackpot!
 * increases the damage of your next empower spell by 20%, stacking up to 2 times.
 */
class TWW2TierSet extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  private uses: SpellUse[] = [];
  private jackpotConsumes: JackpotConsume[] = [];

  isFlameshaper = false;

  fireBreathSpell = this.selectedCombatant.hasTalent(TALENTS.FONT_OF_MAGIC_DEVASTATION_TALENT)
    ? SPELLS.FIRE_BREATH_FONT
    : SPELLS.FIRE_BREATH;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.TWW2);

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.JACKPOT_BUFF),
      this.onJackpotRemove,
    );

    this.addEventListener(Events.fightend, this.finalize);

    this.isFlameshaper = this.selectedCombatant.hasTalent(TALENTS.ENGULF_TALENT);
  }

  onJackpotRemove(event: RemoveBuffEvent) {
    const empowerEvent = GetRelatedEvent<EmpowerEndEvent>(event, JACKPOT_CONSUME);

    this.jackpotConsumes.push({
      event,
      stacks: getConsumedJackpotStacks(event),
      empowerEvent: empowerEvent,
      remainingFireBreathCooldown: this.spellUsable.cooldownRemaining(this.fireBreathSpell.id),
      engulfChargesAvailable: this.spellUsable.chargesAvailable(TALENTS.ENGULF_TALENT.id),
    });
  }

  private finalize() {
    // finalize performances
    this.uses = this.jackpotConsumes.map((jackpotConsume) => this.jackpotUsage(jackpotConsume));
  }

  private jackpotUsage(jackpotConsume: JackpotConsume): SpellUse {
    const checklistItems: ChecklistUsageInfo[] = [];

    const stackPerformance = this.getStackPerformance(jackpotConsume);
    checklistItems.push({
      check: 'jackpot-stack-performance',
      timestamp: jackpotConsume.event.timestamp,
      ...stackPerformance,
    });

    const empowerUsage = this.getEmpowerPerformance(jackpotConsume);
    if (empowerUsage) {
      checklistItems.push({
        check: 'jackpot-empower-performance',
        timestamp: jackpotConsume.event.timestamp,
        ...empowerUsage,
      });
    }

    const actualPerformance = combineQualitativePerformances(
      checklistItems.map((item) => item.performance),
    );

    return {
      event: jackpotConsume.event,
      performance: actualPerformance,
      checklistItems,
      performanceExplanation:
        actualPerformance !== QualitativePerformance.Fail
          ? `${actualPerformance} Usage`
          : 'Bad Usage',
    };
  }

  private getStackPerformance(jackpotConsume: JackpotConsume) {
    if (!jackpotConsume.empowerEvent) {
      return {
        performance: QualitativePerformance.Fail,
        summary: <>Buff consumed</>,
        details: (
          <div key="jackpot-stack">
            Buff went unconsumed! You should always make sure to consume it with either{' '}
            <SpellLink spell={SPELLS.FIRE_BREATH} /> or <SpellLink spell={SPELLS.ETERNITY_SURGE} />.
          </div>
        ),
      };
    }

    return {
      performance:
        jackpotConsume.stacks === 2 ? QualitativePerformance.Perfect : QualitativePerformance.Good,
      summary: <>Buff consumed at {jackpotConsume.stacks} stack(s)</>,
      details: (
        <div key="jackpot-stack">
          Buff was consumed at {jackpotConsume.stacks} stack(s). Good job!
        </div>
      ),
    };
  }

  private getEmpowerPerformance(jackpotConsume: JackpotConsume) {
    if (!jackpotConsume.empowerEvent) {
      return;
    }

    const summary = (
      <>
        Buff consumed by <SpellLink spell={jackpotConsume.empowerEvent.ability.guid} />
      </>
    );

    // Fire Breath is always a perfect consume
    if (jackpotConsume.empowerEvent.ability.guid === this.fireBreathSpell.id) {
      return {
        performance: QualitativePerformance.Perfect,
        summary,
        details: (
          <div key="jackpot-empower">
            Buff was consumed by <SpellLink spell={jackpotConsume.empowerEvent.ability.guid} />.
            Good job!
          </div>
        ),
      };
    }

    // SC Eternity Surge - Always good
    if (!this.isFlameshaper) {
      return {
        performance: QualitativePerformance.Good,
        summary,
        details: (
          <div key="jackpot-empower">
            Buff was consumed by <SpellLink spell={jackpotConsume.empowerEvent.ability.guid} />.
            Good job!
          </div>
        ),
      };
    }

    // FS Eternity Surge - Only good under certain conditions
    if (
      jackpotConsume.remainingFireBreathCooldown >= MIN_FB_CD_FOR_ES_CONSUME_MS &&
      jackpotConsume.engulfChargesAvailable === 0
    ) {
      return {
        performance: QualitativePerformance.Good,
        summary,
        details: (
          <div key="jackpot-empower">
            Buff was consumed by <SpellLink spell={jackpotConsume.empowerEvent.ability.guid} /> when{' '}
            <SpellLink spell={SPELLS.FIRE_BREATH} />
            's cooldown had {(jackpotConsume.remainingFireBreathCooldown / 1_000).toFixed(1)}{' '}
            seconds remaining, and no <SpellLink spell={TALENTS.ENGULF_TALENT} /> charges were
            available. Good job!
          </div>
        ),
      };
    }

    let failExplanation;
    if (jackpotConsume.remainingFireBreathCooldown <= MIN_FB_CD_FOR_ES_CONSUME_MS) {
      failExplanation = (
        <>
          <SpellLink spell={SPELLS.FIRE_BREATH} /> had{' '}
          {(jackpotConsume.remainingFireBreathCooldown / 1_000).toFixed(1)} seconds remaining on its
          cooldown.
        </>
      );
    }

    if (jackpotConsume.engulfChargesAvailable > 0) {
      failExplanation = (
        <>
          {failExplanation ? <>{failExplanation} And </> : null}
          <SpellLink spell={TALENTS.ENGULF_TALENT} /> had {jackpotConsume.engulfChargesAvailable}{' '}
          charge(s) available.
        </>
      );
    }

    return {
      performance: QualitativePerformance.Fail,
      summary,
      details: (
        <div key="jackpot-empower">
          Buff was consumed by <SpellLink spell={jackpotConsume.empowerEvent.ability.guid} /> when
          it should have been consumed by <SpellLink spell={SPELLS.FIRE_BREATH} /> because:
          <br />
          {failExplanation}
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
        The Devastation Undermine 4-piece set grants the{' '}
        <strong>
          <SpellLink spell={SPELLS.JACKPOT_BUFF} />
        </strong>{' '}
        buff.
        <br />
        {this.isFlameshaper ? (
          <>
            Flameshaper should always consume <SpellLink spell={SPELLS.JACKPOT_BUFF} /> with{' '}
            <SpellLink spell={SPELLS.FIRE_BREATH} />.
            {this.selectedCombatant.hasTalent(TALENTS.FLAME_SIPHON_TALENT) && (
              <>
                <br />
                However, with the cooldown reduction from{' '}
                <SpellLink spell={TALENTS.FLAME_SIPHON_TALENT} />, your empowers can quickly get
                desynced. Therefore it's acceptable to consume{' '}
                <SpellLink spell={SPELLS.JACKPOT_BUFF} /> with{' '}
                <SpellLink spell={SPELLS.ETERNITY_SURGE} /> when{' '}
                <SpellLink spell={SPELLS.FIRE_BREATH} />
                's cooldown is greater than {(MIN_FB_CD_FOR_ES_CONSUME_MS / 1_000).toFixed(0)}{' '}
                seconds, and no <SpellLink spell={TALENTS.ENGULF_TALENT} /> charges are available.
              </>
            )}
          </>
        ) : (
          <>
            It should be consumed using either <SpellLink spell={SPELLS.FIRE_BREATH} /> or{' '}
            <SpellLink spell={SPELLS.ETERNITY_SURGE} />.
          </>
        )}
      </section>
    );

    return (
      <ContextualSpellUsageSubSection
        title="Jackpot!"
        explanation={explanation}
        uses={this.uses}
        castBreakdownSmallText={
          <> - These boxes represent each cast, colored by how good the usage was.</>
        }
        abovePerformanceDetails={<div style={{ marginBottom: 10 }}></div>}
      />
    );
  }
}

export default TWW2TierSet;
