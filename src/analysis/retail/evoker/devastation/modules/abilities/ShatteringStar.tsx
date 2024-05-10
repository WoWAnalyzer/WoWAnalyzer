import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import Events, {
  CastEvent,
  DamageEvent,
  EmpowerEndEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
} from 'parser/core/Events';
import Spell from 'common/SPELLS/Spell';
import { ChecklistUsageInfo, SpellUse, UsageInfo } from 'parser/core/SpellUsage/core';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import { formatNumber } from 'common/format';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ItemLink, SpellLink } from 'interface';
import ContextualSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import DonutChart, { Item } from 'parser/ui/DonutChart';
import { eventGeneratedEB } from 'analysis/retail/evoker/shared/modules/normalizers/EssenceBurstCastLinkNormalizer';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { ETERNITY_SURGE_FROM_CAST } from '../normalizers/EternitySurgeNormalizer';
import ITEMS from 'common/ITEMS/evoker';
import {
  LIVING_FLAME_CAST_HIT,
  getLeapingEvents,
  getLivingFlameCastHit,
  isFromLeapingFlames,
} from 'analysis/retail/evoker/shared/modules/normalizers/LeapingFlamesNormalizer';

const WHITELISTED_DAMAGE_SPELLS: Spell[] = [
  SPELLS.DISINTEGRATE,
  SPELLS.AZURE_STRIKE,
  SPELLS.LIVING_FLAME_DAMAGE,
  SPELLS.PYRE,
  SPELLS.FIRE_BREATH_DOT,
  SPELLS.ETERNITY_SURGE_DAM,
  TALENTS.UNRAVEL_TALENT,
  SPELLS.FIRESTORM_DAMAGE,
  SPELLS.DEEP_BREATH_DAM,
  TALENTS.SHATTERING_STAR_TALENT,
];

const WEAK_CASTS: number[] = [SPELLS.AZURE_STRIKE.id, TALENTS.FIRESTORM_TALENT.id];

const WHITELISTED_SPELLS: Spell[] = [
  SPELLS.AZURE_STRIKE,
  TALENTS.FIRESTORM_TALENT,
  SPELLS.DEEP_BREATH,
  SPELLS.DISINTEGRATE,
  SPELLS.LIVING_FLAME_CAST,
  TALENTS.PYRE_TALENT,
  TALENTS.UNRAVEL_TALENT,
  TALENTS.SHATTERING_STAR_TALENT,
];

const EMPOWERS: Spell[] = [
  SPELLS.FIRE_BREATH,
  SPELLS.FIRE_BREATH_FONT,
  SPELLS.ETERNITY_SURGE,
  SPELLS.ETERNITY_SURGE_FONT,
];

const SHATTERING_STAR_AMP_MULTIPLIER = 0.2;

type DamageRecord = {
  [key: number]: number;
};
type CastRecord = {
  [key: number]: (CastEvent | EmpowerEndEvent)[];
};

type ShatteringStarWindow = {
  event: CastEvent | EmpowerEndEvent;
  damage: number;
  casts: CastRecord;
  ampedDamage: DamageRecord;
  essenceBurst?: 'generated' | 'wasted';
};

type CastPerformance = {
  amountOfPowerfulCasts: number;
  amountOfWeakCasts: number;
  strongCastInfo: JSX.Element[];
  weakCastInfo: JSX.Element[];
};

type CastPerformanceCheck = {
  strongCast: UsageInfo;
  weakCast?: UsageInfo;
};

class ShatteringStar extends Analyzer {
  private uses: SpellUse[] = [];
  private shatteringStarWindows: ShatteringStarWindow[] = [];

  totalAmpedDamageRecord: DamageRecord = {};
  totalShatteringStarDamage = 0;

  hasArcaneVigor = false;
  hasFocusingIris = false;

  activeTargets = new Set<string>();
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SHATTERING_STAR_TALENT);

    this.hasArcaneVigor = this.selectedCombatant.hasTalent(TALENTS.ARCANE_VIGOR_TALENT);
    this.hasFocusingIris = this.selectedCombatant.hasTalent(TALENTS.FOCUSING_IRIS_TALENT);

    // Spells that aren't tracked are all situational casts that we most likely shouldn't be bonking
    // eg. verdant embrace as a defensive cast, it's not optimal, but in that situation it is.
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(WHITELISTED_SPELLS), this.onCast);
    this.addEventListener(Events.empowerEnd.by(SELECTED_PLAYER).spell(EMPOWERS), this.onCast);

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(TALENTS.SHATTERING_STAR_TALENT),
      (event) => this.activeTargets.add(encodeEventTargetString(event)),
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(TALENTS.SHATTERING_STAR_TALENT),
      (event) => this.activeTargets.delete(encodeEventTargetString(event)),
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(WHITELISTED_DAMAGE_SPELLS),
      this.onDamage,
    );
    this.addEventListener(Events.fightend, this.finalize);
  }

  private onCast(event: CastEvent | EmpowerEndEvent) {
    const spellId = event.ability.guid;
    if (spellId === TALENTS.SHATTERING_STAR_TALENT.id) {
      this.shatteringStarWindows.push({
        event,
        damage: 0,
        casts: {},
        ampedDamage: {},
      });

      if (this.hasArcaneVigor) {
        this.currentWindow!.essenceBurst = eventGeneratedEB(event) ? 'generated' : 'wasted';
      }

      // Shattering star amps itself so therefore you could *technically*
      // cast another shattering star in the window - but like, 20s CD, 6s max debuff
      // so no, not happening
      return;
    }

    if (!this.currentWindow || !this.activeTargets.size) {
      return;
    }

    if (!this.currentWindow.casts[spellId]) {
      this.currentWindow.casts[spellId] = [];
    }
    this.currentWindow.casts[spellId].push(event);

    /** Since Eternity Surge damage is calculated on cast and not on hit
     * We need to get the damage events for the cast and add them.
     * This is needed since debuff can drop before the damage hits, but it
     * will still be amped. */
    if (spellId === SPELLS.ETERNITY_SURGE.id || spellId === SPELLS.ETERNITY_SURGE_FONT.id) {
      const damageEvents = GetRelatedEvents<DamageEvent>(event, ETERNITY_SURGE_FROM_CAST);
      damageEvents.forEach((event) => this.addAmpedDamage(event));
    }
    // The same applies for Living Flame
    if (spellId === SPELLS.LIVING_FLAME_CAST.id && event.type === EventType.Cast) {
      const castDamageEvent = getLivingFlameCastHit(event);
      const leapingFlamesDamageEvents = getLeapingEvents(event);

      const livingFlameEvents = [castDamageEvent, ...leapingFlamesDamageEvents];

      livingFlameEvents.forEach(
        (event) => event && event.type === EventType.Damage && this.addAmpedDamage(event),
      );
    }
  }

  private onDamage(event: DamageEvent) {
    if (!this.currentWindow || !this.targetHasDebuff(event)) {
      return;
    }

    const spellId = event.ability.guid;
    if (spellId === TALENTS.SHATTERING_STAR_TALENT.id) {
      const amount = event.amount + (event.absorbed ?? 0);
      this.currentWindow.damage += amount;
      this.totalShatteringStarDamage += amount;
      return;
    }

    if (
      (spellId === SPELLS.ETERNITY_SURGE_DAM.id &&
        HasRelatedEvent(event, ETERNITY_SURGE_FROM_CAST)) ||
      (spellId === SPELLS.LIVING_FLAME_DAMAGE.id &&
        (HasRelatedEvent(event, LIVING_FLAME_CAST_HIT) || isFromLeapingFlames(event)))
    ) {
      /** Since Eternity Surge damage is calculated on cast, we should get
       * these events on the cast event, Scintillation procs are still FFA
       * sine we cant source them properly
       * The same applies for Living Flame */
      return;
    }

    this.addAmpedDamage(event);
  }

  private addAmpedDamage(event: DamageEvent) {
    if (!this.currentWindow || !this.targetHasDebuff(event)) {
      return;
    }
    const spellId = event.ability.guid;
    const shatteringAmpStarDamage = calculateEffectiveDamage(event, SHATTERING_STAR_AMP_MULTIPLIER);
    this.currentWindow.ampedDamage[spellId] =
      (this.currentWindow.ampedDamage[spellId] ?? 0) + shatteringAmpStarDamage;

    this.totalAmpedDamageRecord[spellId] =
      (this.totalAmpedDamageRecord[spellId] ?? 0) + shatteringAmpStarDamage;
  }

  private get currentWindow(): ShatteringStarWindow | undefined {
    return this.shatteringStarWindows.length
      ? this.shatteringStarWindows[this.shatteringStarWindows.length - 1]
      : undefined;
  }

  private targetHasDebuff(event: DamageEvent) {
    const targetString = encodeEventTargetString(event) ?? '';
    return this.activeTargets.has(targetString);
  }

  private finalize() {
    // finalize performances
    this.uses = this.shatteringStarWindows.map((window) => this.shatteringStarUsage(window));
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
   * Groups casts together as either strong or weak */
  private getCastPerformance(casts: CastRecord): CastPerformanceCheck {
    const castEntries = Object.entries(casts);

    /** We used Shattering Star without casting any spells afterwards, very bad */
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

    const castPerformance = Object.entries(casts).reduce<CastPerformance>(
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

    let strongCastPerformance = QualitativePerformance.Perfect;
    let strongCastMainExplanation: JSX.Element = (
      <>
        You had {castPerformance.amountOfPowerfulCasts} strong cast(s) in your{' '}
        <SpellLink spell={TALENTS.SHATTERING_STAR_TALENT} /> window, good job!
      </>
    );

    /** Whilst this check might be set highly, it should still be fair
     * since you should be consistently able to reach these casts amounts
     * with proper play.
     * And we only start bonking when the cast amount is very low. */
    const perfectStrongCastAmount = this.hasFocusingIris ? 4 : 3;
    if (castPerformance.amountOfPowerfulCasts < perfectStrongCastAmount) {
      strongCastMainExplanation = (
        <>
          You only had {castPerformance.amountOfPowerfulCasts} strong cast(s) in your{' '}
          <SpellLink spell={TALENTS.SHATTERING_STAR_TALENT} /> window. You should aim to have{' '}
          {perfectStrongCastAmount} strong casts in each window.
        </>
      );
      switch (castPerformance.amountOfPowerfulCasts) {
        case 0:
          strongCastMainExplanation = (
            <>
              You had no strong casts in your <SpellLink spell={TALENTS.SHATTERING_STAR_TALENT} />{' '}
              window! You should always follow up your{' '}
              <SpellLink spell={TALENTS.SHATTERING_STAR_TALENT} /> cast with strong casts to take
              advantage of the damage amp it provides!
            </>
          );
          strongCastPerformance = QualitativePerformance.Fail;
          break;
        case this.hasFocusingIris ? 2 : 1:
          strongCastPerformance = QualitativePerformance.Ok;
          break;
        default:
          strongCastPerformance = QualitativePerformance.Good;
          break;
      }
    }

    const performanceCheck: CastPerformanceCheck = {
      strongCast: {
        performance: strongCastPerformance,
        summary: <div>{castPerformance.amountOfPowerfulCasts} Strong cast(s)</div>,
        details: (
          <div>
            <div key="strong-cast-main-explanation">{strongCastMainExplanation}</div>
            {castPerformance.strongCastInfo}
          </div>
        ),
      },
    };

    if (castPerformance.amountOfWeakCasts > 0) {
      performanceCheck.weakCast = {
        performance: QualitativePerformance.Fail,
        summary: <div>{castPerformance.amountOfWeakCasts} Weak cast(s)</div>,
        details: (
          <div>
            <div key="weak-cast-main-explanation">
              You had {castPerformance.amountOfWeakCasts} weak cast(s) in your{' '}
              <SpellLink spell={TALENTS.SHATTERING_STAR_TALENT} /> window. This should always be
              avoided!
            </div>
            {castPerformance.weakCastInfo}
          </div>
        ),
      };
    }

    return performanceCheck;
  }

  /** Determine whether or not a spell had strong or weak casts
   * returns information about the spell usage */
  private getSpellCastInfo(
    spellId: number,
    casts: (CastEvent | EmpowerEndEvent)[],
  ): { amountOfPowerfulCasts: number; amountOfWeakCasts: number; info: JSX.Element } {
    if (WEAK_CASTS.includes(spellId)) {
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

  statistic(): JSX.Element | null {
    if (!this.active) {
      return null;
    }

    const colors = [
      'rgb(41,134,204)',
      'rgb(123,188,93)',
      'rgb(216,59,59)',
      'rgb(153, 102, 255)',
      'rgb(255, 159, 64)',
      'rgb(255, 206, 86)',
    ];

    const { ampedSources, totalAmpedDamage, otherAmount } = Object.entries(
      this.totalAmpedDamageRecord,
    )
      .sort((a, b) => b[1] - a[1])
      .reduce<{ ampedSources: Item[]; totalAmpedDamage: number; otherAmount: number }>(
        (acc, [spellId, amount], idx) => {
          acc.totalAmpedDamage += amount;
          const color = colors.at(idx);

          if (color) {
            acc.ampedSources.push({
              color: color,
              label: <SpellLink spell={parseInt(spellId)} />,
              valueTooltip: `${formatNumber(amount)} damage amped`,
              value: amount,
            });
          } else {
            /** If we go beyond 6 entries, consolidate the rest.
             * Due to how Devastation damage breakdown is structured
             * this value will pretty much always amount to 0%, maybe
             * a couple %% in edgecases.
             * Kinda w/e to keep printing entries infinitely */
            acc.otherAmount += amount;
          }
          return acc;
        },
        { ampedSources: [], totalAmpedDamage: 0, otherAmount: 0 },
      );

    if (otherAmount > 0) {
      ampedSources.push({
        color: 'rgb(86, 205, 247)',
        label: 'Other',
        valueTooltip: `${formatNumber(otherAmount)} damage amped`,
        value: otherAmount,
      });
    }

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Total damage: {formatNumber(this.totalShatteringStarDamage + totalAmpedDamage)}</li>
            <li>
              <SpellLink spell={TALENTS.SHATTERING_STAR_TALENT} /> damage:{' '}
              {formatNumber(this.totalShatteringStarDamage)}
            </li>
            <li>Amped damage: {formatNumber(totalAmpedDamage)}</li>
          </>
        }
      >
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS.SHATTERING_STAR_TALENT} />
          </label>
          <div className="value">
            <ItemDamageDone amount={this.totalShatteringStarDamage} />
          </div>
          <strong>Amped damage:</strong>
          <div className="value">
            <ItemDamageDone amount={totalAmpedDamage} />
          </div>
          <DonutChart items={ampedSources} />
        </div>
      </Statistic>
    );
  }
}

export default ShatteringStar;
