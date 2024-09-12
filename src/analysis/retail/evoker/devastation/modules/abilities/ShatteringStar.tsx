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
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import { formatNumber } from 'common/format';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { SpellLink } from 'interface';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import DonutChart, { Item } from 'parser/ui/DonutChart';
import { eventGeneratedEB } from 'analysis/retail/evoker/shared/modules/normalizers/EssenceBurstCastLinkNormalizer';
import { ETERNITY_SURGE_FROM_CAST } from '../normalizers/EternitySurgeNormalizer';
import {
  LIVING_FLAME_CAST_HIT,
  getLeapingEvents,
  getLivingFlameCastHit,
  isFromLeapingFlames,
} from 'analysis/retail/evoker/shared/modules/normalizers/LeapingFlamesNormalizer';
import { SHATTERING_STAR_AMP_MULTIPLIER } from '../../constants';
import { DEEP_BREATH_SPELLS } from 'analysis/retail/evoker/shared';

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
  SPELLS.ENGULF_DAMAGE,
  SPELLS.MELT_ARMOR,
];

const WHITELISTED_SPELL_CASTS: Spell[] = [
  SPELLS.AZURE_STRIKE,
  TALENTS.FIRESTORM_TALENT,
  ...DEEP_BREATH_SPELLS,
  SPELLS.DISINTEGRATE,
  SPELLS.LIVING_FLAME_CAST,
  TALENTS.PYRE_TALENT,
  TALENTS.UNRAVEL_TALENT,
  TALENTS.SHATTERING_STAR_TALENT,
  TALENTS.ENGULF_TALENT,
];

const EMPOWERS: Spell[] = [
  SPELLS.FIRE_BREATH,
  SPELLS.FIRE_BREATH_FONT,
  SPELLS.ETERNITY_SURGE,
  SPELLS.ETERNITY_SURGE_FONT,
];

const BASE_AMP_DURATION = 4_000;

export type DamageRecord = {
  [key: number]: { base: number; focusingIris: number };
};
export type CastRecord = {
  [key: number]: (CastEvent | EmpowerEndEvent)[];
};

export type ShatteringStarWindow = {
  event: CastEvent | EmpowerEndEvent;
  casts: CastRecord;
  ampedDamage: DamageRecord;
  essenceBurst?: 'generated' | 'wasted';
};

/**
 * Shattering Star
 * Exhale a bolt of concentrated power from your mouth at 1 enemy
 * that cracks the  target's defenses, increasing the damage they
 * take from you by 20% for 4 sec.
 *
 * Arcane Vigor
 * Shattering Star grants Essence Burst.
 *
 * Focusing Iris
 * Shattering Star's damage taken effect lasts 2 sec longer.
 */
class ShatteringStar extends Analyzer {
  private shatteringStarWindows: ShatteringStarWindow[] = [];

  totalAmpedDamageRecord: DamageRecord = {};
  totalShatteringStarDamage = 0;

  hasArcaneVigor = false;
  hasFocusingIris = false;

  activeTargets = new Map<string, number>();
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SHATTERING_STAR_TALENT);

    this.hasArcaneVigor = this.selectedCombatant.hasTalent(TALENTS.ARCANE_VIGOR_TALENT);
    this.hasFocusingIris = this.selectedCombatant.hasTalent(TALENTS.FOCUSING_IRIS_TALENT);

    // Spells that aren't tracked are all situational casts that we most likely shouldn't be bonking
    // eg. verdant embrace as a defensive cast, it's not optimal, but in that situation it is.
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(WHITELISTED_SPELL_CASTS),
      this.onCast,
    );
    this.addEventListener(Events.empowerEnd.by(SELECTED_PLAYER).spell(EMPOWERS), this.onCast);

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(TALENTS.SHATTERING_STAR_TALENT),
      (event) => this.activeTargets.set(encodeEventTargetString(event), event.timestamp),
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(TALENTS.SHATTERING_STAR_TALENT),
      (event) => this.activeTargets.delete(encodeEventTargetString(event)),
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(WHITELISTED_DAMAGE_SPELLS),
      this.onDamage,
    );
  }

  private onCast(event: CastEvent | EmpowerEndEvent) {
    const spellId = event.ability.guid;
    if (spellId === TALENTS.SHATTERING_STAR_TALENT.id) {
      this.shatteringStarWindows.push({
        event,
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
      damageEvents.forEach((damageEvent) => this.addAmpedDamage(damageEvent, event.timestamp));
    }
    // The same applies for Living Flame
    if (spellId === SPELLS.LIVING_FLAME_CAST.id && event.type === EventType.Cast) {
      const castDamageEvent = getLivingFlameCastHit(event);
      const leapingFlamesDamageEvents = getLeapingEvents(event);

      const livingFlameEvents = [castDamageEvent, ...leapingFlamesDamageEvents];

      livingFlameEvents.forEach(
        (damageEvent) =>
          damageEvent?.type === EventType.Damage &&
          this.addAmpedDamage(damageEvent, event.timestamp),
      );
    }
  }

  private onDamage(event: DamageEvent) {
    if (!this.currentWindow || this.getTargetDebuffStart(event) === undefined) {
      return;
    }

    const spellId = event.ability.guid;
    if (spellId === TALENTS.SHATTERING_STAR_TALENT.id) {
      const amount = event.amount + (event.absorbed ?? 0);
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

  private addAmpedDamage(event: DamageEvent, timestamp?: number) {
    const targetHitTimestamp = this.getTargetDebuffStart(event);
    if (!this.currentWindow || targetHitTimestamp === undefined) {
      return;
    }
    const spellId = event.ability.guid;
    const shatteringAmpStarDamage = calculateEffectiveDamage(event, SHATTERING_STAR_AMP_MULTIPLIER);

    const curSpellWindow = this.currentWindow.ampedDamage[spellId] ?? { base: 0, focusingIris: 0 };
    const curTotSpellWindow = this.totalAmpedDamageRecord[spellId] ?? {
      base: 0,
      focusingIris: 0,
    };

    if (
      this.hasFocusingIris &&
      (timestamp ?? event.timestamp) - targetHitTimestamp > BASE_AMP_DURATION
    ) {
      curSpellWindow.focusingIris = curSpellWindow.focusingIris + shatteringAmpStarDamage;

      curTotSpellWindow.focusingIris = curTotSpellWindow.focusingIris + shatteringAmpStarDamage;
    } else {
      curSpellWindow.base = curSpellWindow.base + shatteringAmpStarDamage;
      curTotSpellWindow.base = curTotSpellWindow.base + shatteringAmpStarDamage;
    }

    this.currentWindow.ampedDamage[spellId] = curSpellWindow;
    this.totalAmpedDamageRecord[spellId] = curTotSpellWindow;
  }

  private get currentWindow(): ShatteringStarWindow | undefined {
    return this.shatteringStarWindows.length
      ? this.shatteringStarWindows[this.shatteringStarWindows.length - 1]
      : undefined;
  }

  get windows(): ShatteringStarWindow[] {
    return this.shatteringStarWindows;
  }

  private getTargetDebuffStart(event: DamageEvent) {
    const targetString = encodeEventTargetString(event) ?? '';
    return this.activeTargets.get(targetString);
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

    const { ampedSources, baseAmpedAmount, otherAmount, focusingIrisAmount } = Object.entries(
      this.totalAmpedDamageRecord,
    )
      .sort((a, b) => b[1].base + b[1].focusingIris - (a[1].base + a[1].focusingIris))
      .reduce<{
        ampedSources: Item[];
        baseAmpedAmount: number;
        otherAmount: number;
        focusingIrisAmount: number;
      }>(
        (acc, [spellId, amount], idx) => {
          const totAmount = amount.base + amount.focusingIris;
          acc.baseAmpedAmount += amount.base;
          acc.focusingIrisAmount += amount.focusingIris;

          const color = colors.at(idx);

          if (color) {
            acc.ampedSources.push({
              color: color,
              label: <SpellLink spell={parseInt(spellId)} />,
              valueTooltip: `${formatNumber(totAmount)} damage amped`,
              value: totAmount,
            });
          } else {
            /** If we go beyond 6 entries, consolidate the rest.
             * Due to how Devastation damage breakdown is structured
             * this value will pretty much always amount to 0%, maybe
             * a couple %% in edgecases.
             * Kinda w/e to keep printing entries infinitely */
            acc.otherAmount += totAmount;
          }
          return acc;
        },
        { ampedSources: [], baseAmpedAmount: 0, otherAmount: 0, focusingIrisAmount: 0 },
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
            <li>Total damage: {formatNumber(this.totalShatteringStarDamage + baseAmpedAmount)}</li>
            <li>
              <SpellLink spell={TALENTS.SHATTERING_STAR_TALENT} /> damage:{' '}
              {formatNumber(this.totalShatteringStarDamage)}
            </li>
            <li>
              {this.hasFocusingIris ? 'Base amped' : 'Amped'} damage:{' '}
              {formatNumber(baseAmpedAmount)}
            </li>
            {this.hasFocusingIris && (
              <li>
                <SpellLink spell={TALENTS.FOCUSING_IRIS_TALENT} /> amped damage:{' '}
                {formatNumber(focusingIrisAmount)}
              </li>
            )}
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
          <h4>{this.hasFocusingIris ? 'Base amped' : 'Amped'} damage</h4>
          <div className="value">
            <ItemDamageDone amount={baseAmpedAmount} />
          </div>
          {this.hasFocusingIris && (
            <div>
              <h4>
                <SpellLink spell={TALENTS.FOCUSING_IRIS_TALENT} />
              </h4>
              <div className="value">
                <ItemDamageDone amount={focusingIrisAmount} />
              </div>
            </div>
          )}
          <DonutChart items={ampedSources} />
        </div>
      </Statistic>
    );
  }
}

export default ShatteringStar;
