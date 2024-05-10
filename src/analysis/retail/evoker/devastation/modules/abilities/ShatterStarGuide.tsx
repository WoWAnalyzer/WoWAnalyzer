import { ChecklistUsageInfo, SpellUse, UsageInfo } from 'parser/core/SpellUsage/core';
import ShatteringStar, { CastRecord, ShatteringStarWindow } from './ShatteringStar';
import { Options } from 'parser/core/Module';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import Events, { CastEvent, EmpowerEndEvent, HasRelatedEvent } from 'parser/core/Events';
import SpellLink from 'interface/SpellLink';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import ITEMS from 'common/ITEMS/evoker';
import ItemLink from 'interface/ItemLink';
import ContextualSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';

const WEAK_CASTS_IDS: Set<number> = new Set([SPELLS.AZURE_STRIKE.id, TALENTS.FIRESTORM_TALENT.id]);

type CastInfo = {
  amountOfPowerfulCasts: number;
  amountOfWeakCasts: number;
  strongCastInfo: JSX.Element[];
  weakCastInfo: JSX.Element[];
};

type CastPerformanceCheck = {
  strongCast: UsageInfo;
  weakCast?: UsageInfo;
};

class ShatteringStarGuide extends ShatteringStar {
  private uses: SpellUse[] = [];
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SHATTERING_STAR_TALENT);

    this.addEventListener(Events.fightend, this.finalize);
  }

  private finalize() {
    // finalize performances
    this.uses = this.windows.map((window) => this.shatteringStarUsage(window));
  }

  /** Rate the performance of the shattering star windows */
  private shatteringStarUsage(window: ShatteringStarWindow): SpellUse {
    const castPerformance = this.getCastPerformance(window.casts);

    const checklistItems: ChecklistUsageInfo[] = [
      {
        check: 'strong-cast-performance',
        timestamp: window.event.timestamp,
        ...castPerformance.strongCast,
      },
    ];
    if (castPerformance.weakCast) {
      checklistItems.push({
        check: 'weak-cast-performance',
        timestamp: window.event.timestamp,
        ...castPerformance.weakCast,
      });
    }

    /** We aren't comparing the weak cast perf since you can still
     * get very strong windows whilst having globals left over for weaker
     * casts, so we will simply base it on the amount of strong casts */
    const performancesToCombine = [castPerformance.strongCast.performance];

    if (window.essenceBurst) {
      const essenceBurstPerformance = this.getEssenceBurstPerformance(window);
      checklistItems.push({
        check: 'essence-burst-performance',
        timestamp: window.event.timestamp,
        ...essenceBurstPerformance,
      });

      performancesToCombine.push(essenceBurstPerformance.performance);
    }

    const actualPerformance = combineQualitativePerformances(performancesToCombine);

    return {
      event: window.event,
      performance: actualPerformance,
      checklistItems,
      performanceExplanation:
        actualPerformance !== QualitativePerformance.Fail
          ? `${actualPerformance} Usage`
          : 'Bad Usage',
    };
  }

  /** Get the performance of each cast in the window
   * Groups casts together as either strong or weak
   * Returns individual perf checks for Strong and Weak casts(if relevant) */
  private getCastPerformance(casts: CastRecord): CastPerformanceCheck {
    const castEntries = Object.entries(casts);

    /** We used Shattering Star without casting any spells afterwards, very bad! */
    if (!castEntries.length) {
      return {
        strongCast: {
          performance: QualitativePerformance.Fail,
          summary: <>No casts in window</>,
          details: (
            <div key="no-casts-in-window">
              You didn't cast any spells in your{' '}
              <SpellLink spell={TALENTS.SHATTERING_STAR_TALENT} /> window!
            </div>
          ),
        },
      };
    }

    /** Get the amount of strong/weak casts made in the window
     * and info about the amount of casts of each spells */
    const castInfo = Object.entries(casts).reduce<CastInfo>(
      (acc, [key, spellCasts]) => {
        const spellId = parseInt(key);
        const { amountOfPowerfulCasts, amountOfWeakCasts, info } = this.getSpellCastInfo(
          spellId,
          spellCasts,
        );

        if (amountOfPowerfulCasts > 0) {
          acc.strongCastInfo.push(info);
        } else {
          acc.weakCastInfo.push(info);
        }

        acc.amountOfPowerfulCasts += amountOfPowerfulCasts;
        acc.amountOfWeakCasts += amountOfWeakCasts;
        return acc;
      },
      {
        amountOfPowerfulCasts: 0,
        amountOfWeakCasts: 0,
        strongCastInfo: [],
        weakCastInfo: [],
      },
    );

    const weakCastUsageInfo =
      castInfo.amountOfWeakCasts > 0
        ? {
            performance: QualitativePerformance.Fail,
            summary: <div>{castInfo.amountOfWeakCasts} Weak cast(s)</div>,
            details: (
              <div>
                <div key="weak-cast-main-explanation">
                  You had {castInfo.amountOfWeakCasts} weak cast(s) in your{' '}
                  <SpellLink spell={TALENTS.SHATTERING_STAR_TALENT} /> window. This should always be
                  avoided!
                </div>
                {castInfo.weakCastInfo}
              </div>
            ),
          }
        : undefined;

    const strongCastSummary = <div>{castInfo.amountOfPowerfulCasts} Strong cast(s)</div>;
    /** Whilst this check might be set highly, it should still be fair
     * since you should be consistently able to reach these casts amounts
     * with proper play.
     * And we only start bonking when the cast amount is very low. */
    const perfectStrongCastAmount = this.hasFocusingIris ? 4 : 3;
    if (castInfo.amountOfPowerfulCasts >= perfectStrongCastAmount) {
      return {
        strongCast: {
          performance: QualitativePerformance.Perfect,
          summary: strongCastSummary,
          details: (
            <div>
              <div key="strong-cast-main-explanation">
                You had {castInfo.amountOfPowerfulCasts} strong cast(s) in your{' '}
                <SpellLink spell={TALENTS.SHATTERING_STAR_TALENT} /> window, good job!
              </div>
              {castInfo.strongCastInfo}
            </div>
          ),
        },
        weakCast: weakCastUsageInfo,
      };
    } else if (castInfo.amountOfPowerfulCasts === 0) {
      return {
        strongCast: {
          performance: QualitativePerformance.Fail,
          summary: strongCastSummary,
          details: (
            <div>
              <div key="strong-cast-main-explanation">
                You had no strong casts in your <SpellLink spell={TALENTS.SHATTERING_STAR_TALENT} />{' '}
                window! You should always follow up your{' '}
                <SpellLink spell={TALENTS.SHATTERING_STAR_TALENT} /> cast with strong casts to take
                advantage of the damage amp it provides!
              </div>
              {castInfo.strongCastInfo}
            </div>
          ),
        },
        weakCast: weakCastUsageInfo,
      };
    }

    const performance =
      castInfo.amountOfPowerfulCasts === (this.hasFocusingIris ? 2 : 1)
        ? QualitativePerformance.Ok
        : QualitativePerformance.Good;

    return {
      strongCast: {
        performance,
        summary: strongCastSummary,
        details: (
          <div>
            <div key="strong-cast-main-explanation">
              You only had {castInfo.amountOfPowerfulCasts} strong cast(s) in your{' '}
              <SpellLink spell={TALENTS.SHATTERING_STAR_TALENT} /> window. You should aim to have{' '}
              {perfectStrongCastAmount} strong casts in each window.
            </div>
            {castInfo.strongCastInfo}
          </div>
        ),
      },
      weakCast: weakCastUsageInfo,
    };
  }

  /** Determine whether or not a spell had strong or weak casts
   * returns information about the spell usage */
  private getSpellCastInfo(
    spellId: number,
    casts: (CastEvent | EmpowerEndEvent)[],
  ): { amountOfPowerfulCasts: number; amountOfWeakCasts: number; info: JSX.Element } {
    if (WEAK_CASTS_IDS.has(spellId)) {
      return {
        amountOfPowerfulCasts: 0,
        amountOfWeakCasts: casts.length,
        info: (
          <div key={`${spellId}`}>
            <SpellLink spell={spellId} /> cast {casts.length} time(s)
          </div>
        ),
      };
    }

    if (spellId === SPELLS.FIRE_BREATH.id || spellId === SPELLS.FIRE_BREATH_FONT.id) {
      // Fire breath is only strong when instant cast
      const isInstant = HasRelatedEvent(casts[0], 'isFromTipTheScales');

      return {
        amountOfPowerfulCasts: isInstant ? 1 : 0,
        amountOfWeakCasts: isInstant ? 0 : 1,
        info: (
          <div key={`${spellId}`}>
            <SpellLink spell={spellId} /> cast {isInstant ? 'with' : 'without'}{' '}
            <SpellLink spell={TALENTS.TIP_THE_SCALES_TALENT} />
          </div>
        ),
      };
    }

    return {
      amountOfPowerfulCasts: casts.length,
      amountOfWeakCasts: 0,
      info: (
        <div key={`${spellId}`}>
          <SpellLink spell={spellId} /> cast {casts.length} time(s)
        </div>
      ),
    };
  }

  private getEssenceBurstPerformance(window: ShatteringStarWindow) {
    if (window.essenceBurst === 'generated') {
      return {
        performance: QualitativePerformance.Perfect,
        summary: (
          <>
            Cast generated <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} />
          </>
        ),
        details: (
          <div key="essence-burst-generated">
            Cast generated <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} />, good job!
          </div>
        ),
      };
    }

    return {
      performance: QualitativePerformance.Fail,
      summary: (
        <>
          Cast wasted <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} />
        </>
      ),
      details: (
        <div key="essence-burst-generated">
          Cast wasted <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} />! Since{' '}
          <SpellLink spell={TALENTS.ARCANE_VIGOR_TALENT} /> is a substantial source of your{' '}
          <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} /> generation, you should always make
          sure to delay <SpellLink spell={SPELLS.SHATTERING_STAR} /> until it wont overcap you.
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
        <p>
          <strong>
            <SpellLink spell={TALENTS.SHATTERING_STAR_TALENT} />
          </strong>{' '}
          provides a small window where your damage gets amplified. To maximize this window aim to
          get as many strong casts off as possible, such as:
          <SpellLink spell={SPELLS.DISINTEGRATE} />, <SpellLink spell={SPELLS.PYRE} /> or{' '}
          <SpellLink spell={SPELLS.ETERNITY_SURGE} />
          <br />
          Whilst avoiding weak casts such as <SpellLink spell={SPELLS.AZURE_STRIKE} />.
        </p>
        <p>
          <strong>Note:</strong> this damage amp only works for your class abilities, and as such
          will not amp trinkets and weapon effects, such as{' '}
          <ItemLink id={ITEMS.KHARNALEX_THE_FIRST_LIGHT.id} />.
        </p>
        {this.hasArcaneVigor && (
          <p>
            With{' '}
            <strong>
              <SpellLink spell={TALENTS.ARCANE_VIGOR_TALENT} />
            </strong>{' '}
            talented you should <b>always</b> avoid overcapping on
            <SpellLink spell={SPELLS.ESSENCE_BURST_BUFF} />.
          </p>
        )}
      </section>
    );

    return (
      <ContextualSpellUsageSubSection
        title="Shattering Star"
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

export default ShatteringStarGuide;
