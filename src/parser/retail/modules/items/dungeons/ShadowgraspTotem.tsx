import { formatNumber, formatPercentage } from 'common/format';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import { ItemIcon, ItemLink, TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, HealEvent, Item } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const SUMMON_SPELL: Spell = SPELLS.SHADOWGRASP_TOTEM_SUMMON;
const DAMAGE_SPELL: Spell = SPELLS.SHADOWGRASP_TOTEM_DAMAGE;
const HEAL_SPELL: Spell = SPELLS.SHADOWGRASP_TOTEM_HEAL;
const COOLDOWN_REDUCTION_SECONDS = 15;
const DEFAULT_COOLDOWN_SECONDS = 60 * 2;
const DEFAULT_TICK_RATE_MS = 1_000;

function calculateHaste(baseTickRate: number, currentTickRate: number) {
  return baseTickRate / currentTickRate - 1;
}

/**
 * Track damage, healing and cooldown reset by Shadowgrasp Totem
 *
 * ## Example log:
 *
 * - https://www.warcraftlogs.com/reports/fZGa6X23CWbm9v8B#fight=9&type=damage-done&source=1
 * - https://www.warcraftlogs.com/reports/twQhDxWCZN2jPbnp#fight=6&type=damage-done&source=13
 */
class ShadowgraspTotem extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    spellUsable: SpellUsable,
  };
  protected abilities!: Abilities;
  protected castEfficiency!: CastEfficiency;
  protected spellUsable!: SpellUsable;

  private item: Item;

  /** Timestamps of damage events since the last cast */
  private currentDot?: number[];
  /** All timestamps of all casts */
  private dots: number[][] = [];
  private totalDamage = 0;
  private healing: number[] = [];

  constructor(
    options: Options & {
      abilities: Abilities;
      castEfficiency: CastEfficiency;
      spellUsable: SpellUsable;
    },
  ) {
    super(options);

    this.item = this.selectedCombatant.getTrinket(ITEMS.SHADOWGRASP_TOTEM.id)!;
    this.active = this.selectedCombatant.hasTrinket(ITEMS.SHADOWGRASP_TOTEM.id);
    if (!this.active) {
      return;
    }

    // Add cast as an ability to show effective usage and cooldown in timeline
    options.abilities.add({
      spell: SUMMON_SPELL.id,
      category: SPELL_CATEGORY.ITEMS,
      cooldown: DEFAULT_COOLDOWN_SECONDS,
      gcd: null,
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.8,
      },
    });

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SUMMON_SPELL), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(DAMAGE_SPELL), this.onDamage);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER).spell(HEAL_SPELL), this.onHeal);
  }

  onCast(event: CastEvent) {
    this.currentDot = [];
    this.dots.push(this.currentDot);
  }

  onDamage(event: DamageEvent) {
    this.currentDot?.push(event.timestamp);
    this.totalDamage += (event.amount || 0) + (event.absorbed || 0);
  }

  onHeal(event: HealEvent) {
    this.healing.push((event.amount || 0) + (event.absorbed || 0));

    // Inform other modules that cooldown has been reduced
    if (this.spellUsable.isOnCooldown(SUMMON_SPELL.id)) {
      this.spellUsable.reduceCooldown(SUMMON_SPELL.id, COOLDOWN_REDUCTION_SECONDS * 1000);
    }
  }

  private getCastEfficiancy() {
    return this.castEfficiency.getCastEfficiencyForSpellId(SUMMON_SPELL.id);
  }

  private get numberHeals() {
    return this.healing.length;
  }

  private get totalHealing() {
    return this.healing.reduce((total, healing) => total + healing, 0);
  }

  private get averageHealing() {
    return this.totalHealing / this.numberHeals;
  }

  private get averageTickRate() {
    return this.dots
      .map((timestamps) =>
        timestamps.reduce(
          (deltas, timestamp, i, array) =>
            i === 0 ? deltas : deltas.concat(timestamp - array[i - 1]),
          [] as number[],
        ),
      )
      .flat()
      .reduce((average, tickRate, i, array) => average + tickRate / array.length, 0);
  }

  private get effectiveHaste() {
    return calculateHaste(DEFAULT_TICK_RATE_MS, this.averageTickRate);
  }

  private get cooldownReductionSeconds() {
    // The heal is triggered at the same point as the cooldown reduction
    return this.numberHeals * COOLDOWN_REDUCTION_SECONDS;
  }
  statistic() {
    const { casts = 0, maxCasts = 0 } = this.getCastEfficiancy() ?? {};

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(100)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <ItemLink id={this.item.id} details={this.item} /> did {formatNumber(this.totalDamage)}{' '}
            damage in the {formatNumber(casts)} times it was used.
            <br />
            {this.numberHeals > 0 ? (
              <>
                Targets died {this.numberHeals} times, which healed a total of{' '}
                {formatNumber(this.totalHealing)} (average {formatNumber(this.averageHealing)} HP)
                and reduced the cooldown by a total of {this.cooldownReductionSeconds} seconds.
              </>
            ) : (
              <>No target died causing no cooldown reduction or healing.</>
            )}
          </>
        }
      >
        <BoringItemValueText item={this.item}>
          {casts} Uses <small>{maxCasts} possible</small>
          <div className="value" style={{ paddingBottom: '0.5em' }}>
            <ItemDamageDone amount={this.totalDamage} />
            <small style={{ display: 'block' }}>
              <TooltipElement
                content={
                  <>
                    The DoT is affected by haste, and ticked in average, every{' '}
                    {formatNumber(this.averageTickRate)}ms, which is an effective haste rate of{' '}
                    {formatPercentage(this.effectiveHaste)}% of the original tickrate of{' '}
                    {DEFAULT_TICK_RATE_MS / 1000}s
                  </>
                }
              >
                Effective haste {formatPercentage(this.effectiveHaste)}%
              </TooltipElement>
            </small>
          </div>
          {this.numberHeals > 0 && (
            <>
              <div className="value">
                <img src="/img/healing.png" alt="Healing" className="icon" />{' '}
                {formatNumber(this.totalHealing)} HP <small>{this.numberHeals} heals</small>
              </div>
              <div className="value">
                <ItemIcon id={this.item.id} details={this.item} /> {this.cooldownReductionSeconds}{' '}
                <small>Seconds cooldown reduced</small>
              </div>
            </>
          )}
        </BoringItemValueText>
      </Statistic>
    );
  }
}

export default ShadowgraspTotem;
