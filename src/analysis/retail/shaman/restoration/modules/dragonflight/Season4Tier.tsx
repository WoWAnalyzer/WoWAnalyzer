import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import Abilities from 'parser/core/modules/Abilities';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import Events, { DeathEvent, HealEvent, SummonEvent } from 'parser/core/Events';
import HIT_TYPES from 'game/HIT_TYPES';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import { SHAMAN_DF4_ID } from 'common/ITEMS/dragonflight';
import { formatNumber, formatPercentage } from 'common/format';
import CritEffectBonus from 'parser/shared/modules/helpers/CritEffectBonus';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringItemSetValueText from 'parser/ui/BoringItemSetValueText';
import { calculateEffectiveHealingFromCritIncrease } from 'parser/core/EventCalculateLib';

/**
 * **Resto Shaman Season 4 **
 *
 * 2pc: While [Cloudburst Totem / Healing Stream Totem] is active, your chance to critically strike is increased by 15%.
 *
 * 4pc : Your critical heals have 220% effectiveness instead of the usual 200%.
 */

const CRIT_RATE_TOTEM_HEALING_INCREASE = 0.15;
const CRIT_EFFECT_INCREASE_4PC = 0.2;

class Season4Tier extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
    statTracker: StatTracker,
    critEffectBonus: CritEffectBonus,
  };
  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;
  protected statTracker!: StatTracker;
  protected critEffectBonus!: CritEffectBonus;
  protected summonedTotems: Set<string> = new Set();
  protected increased2pcHealing: number = 0;
  protected totalHealing: number = 0;
  protected increased4pcHealing: number = 0;
  protected has4pc: boolean;
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.has2PieceByTier(TIERS.DF4);
    this.has4pc = this.selectedCombatant.has4PieceByTier(TIERS.DF4);

    this.addEventListener(Events.summon.by(SELECTED_PLAYER), this.onSummon);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.death.to(SELECTED_PLAYER_PET), this.onDeath);
  }

  getTotemId(targetID: number, targetInstance: number | undefined): string {
    return `${targetID}-${targetInstance}`;
  }

  onSummon(event: SummonEvent) {
    console.log(event);
    if (
      event.ability.guid === TALENTS_SHAMAN.HEALING_STREAM_TOTEM_RESTORATION_TALENT.id ||
      event.ability.guid === TALENTS_SHAMAN.CLOUDBURST_TOTEM_TALENT.id
    ) {
      const totemId = this.getTotemId(event.targetID, event.targetInstance);
      this.summonedTotems.add(totemId);
    }
  }

  onDeath(event: DeathEvent) {
    const totemId = this.getTotemId(event.targetID, event.targetInstance);
    if (this.summonedTotems.has(totemId)) {
      this.summonedTotems.delete(totemId);
    }
  }

  onHeal(event: HealEvent) {
    const nonOverhealHealing = (event.amount || 0) + (event.absorbed || 0);
    this.totalHealing += nonOverhealHealing;
    const is2pcActive = this.active && this.summonedTotems.size > 0;
    const is4pcActive = this.has4pc;
    if (event.hitType === HIT_TYPES.CRIT) {
      // Calculate healing with only the 2pc effect
      const effectiveHealing2pc = calculateEffectiveHealingFromCritIncrease(
        event,
        this.statTracker.critPercentage(event.timestamp, true),
        is2pcActive ? CRIT_RATE_TOTEM_HEALING_INCREASE : 0,
      );
      this.increased2pcHealing += effectiveHealing2pc;

      // Calculate healing with the 4pc effect and attribute the difference
      if (is4pcActive) {
        const effectiveHealing4pc = calculateEffectiveHealingFromCritIncrease(
          event,
          this.statTracker.critPercentage(event.timestamp, true),
          CRIT_RATE_TOTEM_HEALING_INCREASE,
          2 + CRIT_EFFECT_INCREASE_4PC,
        );
        this.increased4pcHealing += effectiveHealing4pc - effectiveHealing2pc;
      }
    }
  }

  statistic() {
    const tierSetId = SHAMAN_DF4_ID;
    const increasedCritPercentage = this.increased2pcHealing / this.totalHealing;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(0)}
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={`
          During totem uptime:
          Total Healing: ${formatNumber(this.totalHealing)}
          Increased Healing from 15% crit chance bonus: ${formatNumber(this.increased2pcHealing)} (${formatPercentage(increasedCritPercentage)}% of total healing)
          Increased Healing from 4pc bonus: ${formatNumber(this.increased4pcHealing)} (${formatPercentage(this.increased4pcHealing / this.totalHealing)}% of total healing)
        `}
      >
        <BoringItemSetValueText
          setId={tierSetId}
          title="Vision of the Greatwolf Outcast (Tier-32 Set)"
        >
          <>
            <div>
              2pc: <ItemPercentHealingDone amount={this.increased2pcHealing} />
              <br />
              {formatPercentage(increasedCritPercentage)}% <small>of healing from 2pc bonus</small>
            </div>
            {this.has4pc && (
              <div>
                4pc: <ItemPercentHealingDone amount={this.increased4pcHealing} />
                <br />
                {formatPercentage(this.increased4pcHealing / this.totalHealing)}%{' '}
                <small>of healing from 4pc bonus</small>
              </div>
            )}
          </>
        </BoringItemSetValueText>
      </Statistic>
    );
  }
}

export default Season4Tier;
