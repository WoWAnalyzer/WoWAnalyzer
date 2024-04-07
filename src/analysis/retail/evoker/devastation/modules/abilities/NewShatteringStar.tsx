import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import Events, { CastEvent, DamageEvent, HasRelatedEvent } from 'parser/core/Events';
import Spell from 'common/SPELLS/Spell';
import { ChecklistUsageInfo, SpellUse, UsageInfo } from 'parser/core/SpellUsage/core';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import { formatNumber } from 'common/format';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SpellLink } from 'interface';
import ContextualSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import { IRIDESCENCE_BLUE_CONSUME } from '../normalizers/CastLinkNormalizer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import DonutChart from 'parser/ui/DonutChart';
import { isMythicPlus } from 'common/isMythicPlus';

const WHITELISTED_SPELLS: Spell[] = [
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

const WHITELISTED_CASTS: Spell[] = [
  SPELLS.AZURE_STRIKE,
  TALENTS.FIRESTORM_TALENT,
  SPELLS.DEEP_BREATH, // maybe weak
  SPELLS.DISINTEGRATE,
  SPELLS.LIVING_FLAME_CAST,
  TALENTS.PYRE_TALENT,
  SPELLS.FIRE_BREATH,
  SPELLS.FIRE_BREATH_FONT,
  SPELLS.ETERNITY_SURGE,
  SPELLS.ETERNITY_SURGE_FONT,
  TALENTS.UNRAVEL_TALENT,
  TALENTS.SHATTERING_STAR_TALENT,
];

const SHATTERING_STAR_AMP_MULTIPLIER = 0.2;

type DamageRecord = {
  [key: number]: number;
};
type CastRecord = {
  [key: number]: CastEvent[];
};

type ShatteringStarWindow = {
  event: CastEvent;
  damage: number;
  casts: CastRecord;
  ampedDamage: DamageRecord;
  // TODO: Arcane Vigor provides an Essence Burst
  essenceBurst?: 'generated' | 'wasted';
};

type CastPerformance = {
  powerfulCasts: number;
  weakCasts: number;
  strongCastExplanations: JSX.Element[];
  weakCastExplanations: JSX.Element[];
};

type CastPerformanceCheck = {
  strongCast: UsageInfo;
  weakCast?: UsageInfo;
};

class NewShatteringStar extends Analyzer {
  private uses: SpellUse[] = [];
  private shatteringStarWindows: ShatteringStarWindow[] = [];

  totalAmpedDamageRecord: DamageRecord = {};
  totalShatteringStarDamage = 0;

  activeTargets = new Set<string>();
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SHATTERING_STAR_TALENT);

    // not tracked spells are all situational casts that we most likely shouldn't be bonking
    // eg. verdant embrace as a defensive cast, it's not optimal, but in that situation it is.
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(WHITELISTED_CASTS), this.onCast);

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(TALENTS.SHATTERING_STAR_TALENT),
      (event) => this.activeTargets.add(encodeEventTargetString(event)),
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(TALENTS.SHATTERING_STAR_TALENT),
      (event) => this.activeTargets.delete(encodeEventTargetString(event)),
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(WHITELISTED_SPELLS),
      this.onDamage,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId === TALENTS.SHATTERING_STAR_TALENT.id) {
      this.shatteringStarWindows.push({
        event,
        damage: 0,
        casts: {},
        ampedDamage: {},
      });
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
  }

  private onDamage(event: DamageEvent) {
    if (!this.currentWindow || !this.targetHasDebuff(event)) {
      return;
    }

    if (event.ability.guid === TALENTS.SHATTERING_STAR_TALENT.id) {
      const amount = event.amount + (event.absorbed ?? 0);
      this.currentWindow.damage += amount;
      this.totalShatteringStarDamage += amount;
      return;
    }

    const shatteringAmpStarDamage = calculateEffectiveDamage(event, SHATTERING_STAR_AMP_MULTIPLIER);
    this.currentWindow.ampedDamage[event.ability.guid] =
      (this.currentWindow.ampedDamage[event.ability.guid] ?? 0) + shatteringAmpStarDamage;

    this.totalAmpedDamageRecord[event.ability.guid] =
      (this.totalAmpedDamageRecord[event.ability.guid] ?? 0) + shatteringAmpStarDamage;
  }

  get currentWindow(): ShatteringStarWindow | undefined {
    return this.shatteringStarWindows.length
      ? this.shatteringStarWindows[this.shatteringStarWindows.length - 1]
      : undefined;
  }

  private targetHasDebuff(event: DamageEvent) {
    const targetString = encodeEventTargetString(event) ?? '';
    return this.activeTargets.has(targetString);
  }

  private onFightEnd() {
    this.finalize();
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

    const iridescencePerformance = this.getIridescencePerformance(window.event);
    if (iridescencePerformance) {
      checklistItems.push(iridescencePerformance);
    }

    // Not bonking for weak casts, but maybe should idk
    const actualPerformance = castPerformance.strongCast.performance;

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

  // Skip check in keys, maybe track if AoE in raid and skip it there also.
  private getIridescencePerformance(event: CastEvent): ChecklistUsageInfo | undefined {
    if (isMythicPlus(this.owner.fight)) {
      return undefined;
    }
    if (HasRelatedEvent(event, IRIDESCENCE_BLUE_CONSUME)) {
      return {
        check: 'iridescence-blue-consume',
        timestamp: event.timestamp,
        performance: QualitativePerformance.Fail,
        summary: <>Consumed Iridescence</>,
        details: (
          <div key="iridescence-blue-consume">
            Cast consumed <SpellLink spell={SPELLS.IRIDESCENCE_BLUE} />. You should try to spend it
            on <SpellLink spell={SPELLS.DISINTEGRATE} /> instead.
          </div>
        ),
      };
    }

    return undefined;
  }

  /** Get the performance of each cast in the window
   * Groups casts together as either strong or weak */
  private getCastPerformance(casts: CastRecord): CastPerformanceCheck {
    const castEntries = Object.entries(casts);
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
        const { powerfulCasts, weakCasts, explanation } = this.getSpellCastExplanation(
          spellId,
          spellCasts,
        );

        if (powerfulCasts > 0) {
          acc.strongCastExplanations.push(explanation);
        } else {
          acc.weakCastExplanations.push(explanation);
        }

        acc.powerfulCasts += powerfulCasts;
        acc.weakCasts += weakCasts;
        return acc;
      },
      { powerfulCasts: 0, weakCasts: 0, strongCastExplanations: [], weakCastExplanations: [] },
    );

    const actualStrongCastAmount = castPerformance.powerfulCasts;
    let strongCastPerformance = QualitativePerformance.Perfect;
    let strongCastMainExplanation: JSX.Element = (
      <>
        You had {actualStrongCastAmount} strong cast(s) in your{' '}
        <SpellLink spell={TALENTS.SHATTERING_STAR_TALENT} /> window, good job!
      </>
    );

    const perfectStrongCastAmount = 3;
    if (actualStrongCastAmount < perfectStrongCastAmount) {
      strongCastMainExplanation = (
        <>
          You only had {actualStrongCastAmount} strong cast(s) in your{' '}
          <SpellLink spell={TALENTS.SHATTERING_STAR_TALENT} /> window. You should always try to have
          at least {perfectStrongCastAmount}.
        </>
      );
      switch (actualStrongCastAmount) {
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
        case 1:
          strongCastPerformance = QualitativePerformance.Ok;
          break;
        default:
          strongCastPerformance = QualitativePerformance.Good;
          break;
      }
    }

    castPerformance.strongCastExplanations.unshift(
      <div key="strong-cast-main-explanation">{strongCastMainExplanation}</div>,
    );

    const performanceCheck: CastPerformanceCheck = {
      strongCast: {
        performance: strongCastPerformance,
        summary: <div>{castPerformance.powerfulCasts} Strong cast(s)</div>,
        details: <div>{castPerformance.strongCastExplanations}</div>,
      },
    };

    const actualWeakCastAmount = castPerformance.weakCasts;
    if (actualWeakCastAmount > 0) {
      castPerformance.weakCastExplanations.unshift(
        <div key="weak-cast-main-explanation">
          You had {actualWeakCastAmount} weak cast(s) in your{' '}
          <SpellLink spell={TALENTS.SHATTERING_STAR_TALENT} /> window. This should always be
          avoided!
        </div>,
      );
      performanceCheck.weakCast = {
        performance: QualitativePerformance.Fail,
        summary: <div>{actualWeakCastAmount} Weak cast(s)</div>,
        details: <div>{castPerformance.weakCastExplanations}</div>,
      };
    }

    return performanceCheck;
  }

  /** Determine whether or not a spell had strong or weak casts
   * returns an explanation of the spell usage */
  private getSpellCastExplanation(
    spellId: number,
    casts: CastEvent[],
  ): { powerfulCasts: number; weakCasts: number; explanation: JSX.Element } {
    const getExplanation = (spellId: number, amount: number, explanation?: JSX.Element) => (
      <div key={`${spellId}`}>
        <SpellLink spell={spellId} /> cast {explanation ? explanation : <>{amount} time(s)</>}
      </div>
    );

    if (WEAK_CASTS.includes(spellId)) {
      return {
        powerfulCasts: 0,
        weakCasts: casts.length,
        explanation: getExplanation(spellId, casts.length),
      };
    }

    // TODO: confirm empower channel was finished before debuff ran out (ES)
    if (spellId === SPELLS.FIRE_BREATH.id || spellId === SPELLS.FIRE_BREATH_FONT.id) {
      // Fire breath is only strong when instant cast
      const isInstant = HasRelatedEvent(casts[0], 'isFromTipTheScales');

      return {
        powerfulCasts: isInstant ? casts.length : 0,
        weakCasts: isInstant ? 0 : casts.length,
        explanation: getExplanation(
          spellId,
          casts.length,
          <>
            {isInstant ? 'with' : 'without'} <SpellLink spell={TALENTS.TIP_THE_SCALES_TALENT} />
          </>,
        ),
      };
    }

    return {
      powerfulCasts: casts.length,
      weakCasts: 0,
      explanation: getExplanation(spellId, casts.length),
    };
  }

  guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }

    const explanation = (
      <section>
        <strong>
          <SpellLink spell={TALENTS.SHATTERING_STAR_TALENT} />
        </strong>{' '}
        Shit amps yo
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
      'rgb(86, 205, 247)',
      'rgb(255, 221, 102)',
      'rgb(154, 205, 50)',
    ];

    const allAmpedSources = Object.entries(this.totalAmpedDamageRecord).sort((a, b) => b[1] - a[1]);
    const top4AmpedSources = allAmpedSources.splice(0, 3);

    let totalAmpedDamage = 0;
    const topAmpedSources = top4AmpedSources.map(([spellId, amount], idx) => {
      totalAmpedDamage += amount;
      return {
        color: colors[idx],
        label: <SpellLink spell={parseInt(spellId)} />,
        valueTooltip: `${formatNumber(amount)} damage amped`,
        value: amount,
      };
    });
    if (allAmpedSources.length) {
      const otherAmpedDamage = allAmpedSources.reduce((a, b) => a + b[1], 0);
      totalAmpedDamage += otherAmpedDamage;
      topAmpedSources.push({
        color: colors[topAmpedSources.length],
        label: <>Other</>,
        valueTooltip: `${formatNumber(otherAmpedDamage)} damage amped`,
        value: otherAmpedDamage,
      });
    }

    const ampedSources = Object.entries(this.totalAmpedDamageRecord)
      .sort((a, b) => b[1] - a[1])
      .map(([spellId, amount], idx) => {
        // Some day, some person (most likely me) will add a spell to the whitelist without adding a new color
        // And that same day, some other guy will amp 11 different spells and brick the whole module
        // So lets just default to a random color
        // Maybe we just smash entries past 4 together instead? I dunno
        const color =
          colors.at(idx) ??
          `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(
            Math.random() * 256,
          )})`;

        return {
          color: color,
          label: <SpellLink spell={parseInt(spellId)} />,
          valueTooltip: `${formatNumber(amount)} damage amped`,
          value: amount,
        };
      });

    const totalDamage = this.totalShatteringStarDamage + totalAmpedDamage;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Total damage: {formatNumber(totalDamage)}</li>
            <li>Shattering Star damage: {formatNumber(this.totalShatteringStarDamage)}</li>
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

export default NewShatteringStar;
