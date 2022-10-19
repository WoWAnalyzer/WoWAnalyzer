import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import CheckmarkIcon from 'interface/icons/Checkmark';
import CrossIcon from 'interface/icons/Cross';
import HealthIcon from 'interface/icons/Health';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_DRUID } from 'common/TALENTS';
import { getDirectHeal } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import { buffedByClearcast } from 'analysis/retail/druid/restoration/normalizers/ClearcastingNormalizer';
import { ExplanationAndDataRow } from 'interface/guide/components/ExplanationAndData';

/** Health percent below which we consider a heal to be 'triage' */
const TRIAGE_THRESHOLD = 0.5;
/** Max time from cast to heal event to consider the events linked */
const MS_BUFFER = 100;
/** Min stacks required to consider a regrowth efficient */
const ABUNDANCE_EXCEPTION_STACKS = 4;

/**
 * Tracks stats relating to Regrowth and the Clearcasting proc
 */
class RegrowthAndClearcasting extends Analyzer {
  /** total clearcasting procs */
  totalClearcasts = 0;
  /** overwritten clearcasting procs */
  overwrittenClearcasts = 0;
  /** set to 1 iff there is a clearcast active at fight end */
  endingClearcasts = 0;

  /** total regrowth hardcasts */
  totalRegrowths = 0;
  /** regrowth hardcasts made free by innervate */
  innervateRegrowths = 0;
  /** regrowth hardcasts made free by nature's swiftness */
  nsRegrowths = 0;
  /** regrowth hardcasts made free by clearcasting */
  ccRegrowths = 0;
  /** regrowth hardcasts that were cheap enough to be efficient due to abundance */
  abundanceRegrowths = 0;
  /** full price regrowth hardcasts that were on low health targets */
  triageRegrowths = 0;
  /** full price regrowth hardcasts on healthy targets */
  badRegrowths = 0;

  castRegrowthLog: RegrowthCast[] = [];

  hasAbundance: boolean;

  constructor(options: Options) {
    super(options);

    this.hasAbundance = this.selectedCombatant.hasTalent(TALENTS_DRUID.ABUNDANCE_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.CLEARCASTING_BUFF),
      this.onApplyClearcast,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.CLEARCASTING_BUFF),
      this.onRefreshClearcast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.onCastRegrowth,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onApplyClearcast() {
    this.totalClearcasts += 1;
  }

  onRefreshClearcast() {
    this.totalClearcasts += 1;
    this.overwrittenClearcasts += 1;
  }

  onCastRegrowth(event: CastEvent) {
    this.totalRegrowths += 1;
    if (this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)) {
      this.innervateRegrowths += 1;
      this._pushToCastLog(event, 'innervate');
      return;
    } else if (
      this.selectedCombatant.hasBuff(SPELLS.NATURES_SWIFTNESS.id, event.timestamp, MS_BUFFER)
    ) {
      this.nsRegrowths += 1;
      this._pushToCastLog(event, 'ns');
    } else if (buffedByClearcast(event)) {
      this.ccRegrowths += 1;
      this._pushToCastLog(event, 'clearcast');
    } else if (
      this.selectedCombatant.getBuffStacks(SPELLS.ABUNDANCE_BUFF.id) >= ABUNDANCE_EXCEPTION_STACKS
    ) {
      this.abundanceRegrowths += 1;
      this._pushToCastLog(event, 'abundance');
    } else {
      // use the heal event to determine if this Regrowth was triage (saving low health player)
      const regrowthHeal = getDirectHeal(event);
      if (regrowthHeal !== undefined) {
        // heals absorbs not technically part of player heal percent,
        // but they're important to remove so we'll include it
        const effectiveHealing = regrowthHeal.amount + (regrowthHeal.absorbed || 0);
        const hitPointsBeforeHeal = regrowthHeal.hitPoints - effectiveHealing;
        const healthPercentage = hitPointsBeforeHeal / regrowthHeal.maxHitPoints;
        if (healthPercentage < TRIAGE_THRESHOLD) {
          this.triageRegrowths += 1;
          this._pushToCastLog(event, 'triage');
        } else {
          this.badRegrowths += 1;
          this._pushToCastLog(event, 'bad');
        }
      } else {
        // shouldn't happen, but just in case something weird is going on
        console.warn("Regrowth cast couldn't be matched to a heal", event);
      }
    }
  }

  onFightEnd() {
    if (this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_BUFF.id)) {
      this.endingClearcasts = 1;
    }
  }

  _pushToCastLog(event: CastEvent | HealEvent, reason: RegrowthReason) {
    const wasGood = reason !== 'bad';
    const abundanceStacks = this.selectedCombatant.getBuffStacks(SPELLS.ABUNDANCE_BUFF.id);
    this.castRegrowthLog.push({ timestamp: event.timestamp, wasGood, reason, abundanceStacks });
  }

  get usedClearcasts() {
    return this.ccRegrowths;
  }

  get expiredClearcasts() {
    return (
      this.totalClearcasts -
      this.overwrittenClearcasts -
      this.usedClearcasts -
      this.endingClearcasts
    );
  }

  get wastedClearcasts() {
    return this.totalClearcasts - this.usedClearcasts;
  }

  /** Percentage of gained clearcasts that were used */
  get clearcastUtilPercent() {
    // return 100% when no clearcasts to avoid suggestion
    // clearcast still active at end shouldn't be counted in util, hence the subtraction from total
    return this.totalClearcasts === 0
      ? 1
      : this.usedClearcasts / (this.totalClearcasts - this.endingClearcasts);
  }

  get freeRegrowths() {
    return this.innervateRegrowths + this.ccRegrowths + this.nsRegrowths;
  }

  /** Guide subsection describing the proper usage of Regrowth */
  get explanationAndData(): ExplanationAndDataRow {
    const hasAbundance = this.selectedCombatant.hasTalent(TALENTS_DRUID.ABUNDANCE_TALENT);
    const explanation = (
      <p>
        <b>
          <SpellLink id={SPELLS.REGROWTH.id} />
        </b>{' '}
        is for urgent spot healing. The HoT is very weak - Regrowth is only efficient when its
        direct portion is effective. Exceptions are when Regrowth is free due to{' '}
        <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} /> /{' '}
        <SpellLink id={SPELLS.NATURES_SWIFTNESS.id} />{' '}
        {hasAbundance && (
          <>
            or cheap due to <SpellLink id={TALENTS_DRUID.ABUNDANCE_TALENT.id} />. With{' '}
            <SpellLink id={TALENTS_DRUID.ABUNDANCE_TALENT.id} /> ramp with Rejuvenation, activate
            cooldowns, and then fill with high-stack Regrowths.
          </>
        )}
      </p>
    );

    const castPerfBoxes = this.castRegrowthLog.map((rgCast) => {
      let message = '';
      if (rgCast.reason === 'innervate') {
        message = 'Free due to Innervate';
      } else if (rgCast.reason === 'ns') {
        message = "Free due to Nature's Swiftness";
      } else if (rgCast.reason === 'clearcast') {
        message = 'Free due to Clearcasting';
      } else if (rgCast.reason === 'abundance') {
        message = `Cheap due to ${rgCast.abundanceStacks} stacks of Abundance`;
      } else if (rgCast.reason === 'triage') {
        message = 'Cast full price on a low health target';
      } else if (rgCast.reason === 'bad') {
        message = 'Cast full price on a high health target';
      }
      return {
        value: rgCast.wasGood,
        tooltip: `@ ${this.owner.formatTimestamp(rgCast.timestamp)} - ${message}`,
      };
    });
    const data = (
      <div>
        <strong>Regrowth casts</strong>
        <small>
          {' '}
          - Green is a good cast, Red is a bad cast (at full mana cost on a high health target).
          Mouseover boxes for details.
        </small>
        <PerformanceBoxRow values={castPerfBoxes} />
      </div>
    );

    return { explanation, data };
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(20)} // chosen for fixed ordering of general stats
        tooltip={
          <>
            <SpellLink id={SPELLS.REGROWTH.id} /> is mana inefficient relative to{' '}
            <SpellLink id={SPELLS.REJUVENATION.id} /> and should only be cast when free due to{' '}
            <SpellLink id={SPELLS.INNERVATE.id} />, <SpellLink id={SPELLS.NATURES_SWIFTNESS.id} />{' '}
            or <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} />,{' '}
            {this.hasAbundance && (
              <>
                cheap due to {ABUNDANCE_EXCEPTION_STACKS}+{' '}
                <SpellLink id={TALENTS_DRUID.ABUNDANCE_TALENT.id} /> stacks,
              </>
            )}{' '}
            or to save a low health target.
            <br />
            <br />
            <strong>
              You hardcast {this.totalRegrowths} <SpellLink id={SPELLS.REGROWTH.id} />
            </strong>
            <ul>
              <li>
                <SpellIcon id={SPELLS.INNERVATE.id} />{' '}
                <SpellIcon id={SPELLS.CLEARCASTING_BUFF.id} />{' '}
                <SpellIcon id={SPELLS.NATURES_SWIFTNESS.id} /> Free Casts:{' '}
                <strong>{this.freeRegrowths}</strong>
              </li>
              {this.hasAbundance && (
                <li>
                  <SpellIcon id={SPELLS.ABUNDANCE_BUFF.id} /> Cheap Casts:{' '}
                  <strong>{this.abundanceRegrowths}</strong>
                </li>
              )}
              <li>
                <HealthIcon /> Full Price Triage ({'<'}
                {formatPercentage(TRIAGE_THRESHOLD, 0)}% HP) Casts:{' '}
                <strong>{this.triageRegrowths}</strong>
              </li>
              <li>
                <CrossIcon /> Bad Casts: <strong>{this.badRegrowths}</strong>
              </li>
            </ul>
            <br />
            <strong>
              You gained {this.totalClearcasts} <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} />
            </strong>
            <ul>
              <li>
                <SpellIcon id={SPELLS.REGROWTH.id} /> Used: <strong>{this.usedClearcasts}</strong>
              </li>
              <li>
                <CrossIcon /> Overwritten: <strong>{this.overwrittenClearcasts}</strong>
              </li>
              <li>
                <UptimeIcon /> Expired: <strong>{this.expiredClearcasts}</strong>
              </li>
              {this.endingClearcasts > 0 && (
                <li>
                  Still active at fight end: <strong>{this.endingClearcasts}</strong>
                </li>
              )}
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.REGROWTH.id}>
          <>
            {this.badRegrowths === 0 ? <CheckmarkIcon /> : <CrossIcon />}
            {'  '}
            {this.badRegrowths} <small>bad casts</small>
            <br />
            <SpellIcon id={SPELLS.CLEARCASTING_BUFF.id} />
            {'  '}
            {formatPercentage(this.clearcastUtilPercent, 1)}% <small>util</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

/** Stats about a Regrowth cast */
type RegrowthCast = {
  timestamp: number;
  wasGood: boolean;
  reason: RegrowthReason;
  abundanceStacks: number;
};

type RegrowthReason = 'innervate' | 'ns' | 'clearcast' | 'abundance' | 'triage' | 'bad';

export default RegrowthAndClearcasting;
