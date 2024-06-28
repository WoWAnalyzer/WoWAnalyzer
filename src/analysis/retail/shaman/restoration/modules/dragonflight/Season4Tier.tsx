import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import Abilities from 'parser/core/modules/Abilities';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import Events, { EventType, HealEvent } from 'parser/core/Events';
import HIT_TYPES from 'game/HIT_TYPES';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import ItemSetLink from 'interface/ItemSetLink';
import { SHAMAN_DF4_ID } from 'common/ITEMS/dragonflight';
import { formatNumber, formatPercentage } from 'common/format';
import CritEffectBonus, { ValidEvents } from 'parser/shared/modules/helpers/CritEffectBonus';
import StatTracker from 'parser/shared/modules/StatTracker';
import ItemHealingDone from 'parser/ui/ItemHealingDone';

/**
 * **Resto Shaman Season 4 **
 *
 * 2pc: While [Cloudburst Totem / Healing Stream Totem] is active, your chance to critically strike is increased by 15%.
 *
 * 4pc : Your critical heals have 220% effectiveness instead of the usual 200%.
 */
enum ActiveTotem {
  Cloudburst = 'cloudburst',
  HealingStream = 'healing_stream',
  None = 'none',
}

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
  protected criticalHealCount: number = 0;
  protected increasedCritHealing: number = 0;
  protected totalHealingDuringTotemUptime: number = 0;
  protected totalCritsFromBonus: number = 0;
  protected activeTotem: ActiveTotem = ActiveTotem.None;
  protected increased4pcHealing: number = 0;
  protected has4pc: boolean;
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.has2PieceByTier(TIERS.DF4);
    this.has4pc = this.selectedCombatant.has4PieceByTier(TIERS.DF4);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.CLOUDBURST_TOTEM_TALENT),
      this.onCloudburstApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.CLOUDBURST_TOTEM_TALENT),
      this.onCloudburstRemove,
    );

    this.addEventListener(
      Events.applybuff
        .by(SELECTED_PLAYER)
        .spell(TALENTS_SHAMAN.HEALING_STREAM_TOTEM_RESTORATION_TALENT),
      this.onHealingStreamApply,
    );
    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .spell(TALENTS_SHAMAN.HEALING_STREAM_TOTEM_RESTORATION_TALENT),
      this.onHealingStreamRemove,
    );
  }

  private onCloudburstApply() {
    this.activeTotem = ActiveTotem.Cloudburst;
  }

  private onCloudburstRemove() {
    if (this.activeTotem === ActiveTotem.Cloudburst) {
      this.activeTotem = ActiveTotem.None;
    }
  }

  private onHealingStreamApply() {
    this.activeTotem = ActiveTotem.HealingStream;
  }

  private onHealingStreamRemove() {
    if (this.activeTotem === ActiveTotem.HealingStream) {
      this.activeTotem = ActiveTotem.None;
    }
  }

  increaseCritEffect(critEffectModifier: number, event: ValidEvents): number {
    if (event.type === EventType.Heal) {
      return critEffectModifier + CRIT_EFFECT_INCREASE_4PC;
    }
    return critEffectModifier;
  }

  increaseCritRate(critEffectModifier: number, event: ValidEvents): number {
    if (event.type === EventType.Heal && this.activeTotem !== ActiveTotem.None) {
      return critEffectModifier * (1 + CRIT_RATE_TOTEM_HEALING_INCREASE);
    }
    return critEffectModifier;
  }

  onHeal(event: HealEvent) {
    if (this.active && this.activeTotem !== ActiveTotem.None) {
      const totalHealing = (event.amount || 0) + (event.absorbed || 0) + (event.overheal || 0);
      this.totalHealingDuringTotemUptime += totalHealing;

      if (event.hitType === HIT_TYPES.CRIT) {
        const normalCritChance = this.statTracker.critPercentage(event.timestamp, true);
        const actualCritChance = normalCritChance + CRIT_RATE_TOTEM_HEALING_INCREASE;
        const chanceOfThisCritDueToBonus = (actualCritChance - normalCritChance) / actualCritChance;

        this.increasedCritHealing += totalHealing * chanceOfThisCritDueToBonus;
        this.totalCritsFromBonus += chanceOfThisCritDueToBonus;

        if (this.has4pc) {
          const critBonus =
            this.critEffectBonus.getBonus(event) - CritEffectBonus.BASE_CRIT_EFFECT_MOD;
          this.increased4pcHealing += totalHealing * (critBonus / 2);
        }
      }
    }
  }

  statistic() {
    const tierSetId = SHAMAN_DF4_ID;
    const increasedCritPercentage = this.increasedCritHealing / this.totalHealingDuringTotemUptime;
    const increased4pcPercentage = this.increased4pcHealing / this.totalHealingDuringTotemUptime;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(0)}
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={`
          During totem uptime:
          Total Healing: ${formatNumber(this.totalHealingDuringTotemUptime)}
          Increased Healing from 15% crit chance bonus: ${formatNumber(this.increasedCritHealing)} (${formatPercentage(increasedCritPercentage)}% of total healing)
          Estimated additional crits: ${formatNumber(this.totalCritsFromBonus)}
          ${this.has4pc ? `Increased Healing from 4pc bonus: ${formatNumber(this.increased4pcHealing)} (${formatPercentage(increased4pcPercentage)}% of total healing)` : ''}
        `}
      >
        <div className="pad boring-text">
          <label>
            <ItemSetLink id={tierSetId}>
              <>
                Vision of the Greatwolf Outcast
                <br />
                (Tier-32 Set)
              </>
            </ItemSetLink>
          </label>
        </div>
        <div className="value">
          <ItemHealingDone
            amount={this.increasedCritHealing + (this.has4pc ? this.increased4pcHealing : 0)}
          />
          <br />
          {formatPercentage(
            increasedCritPercentage + (this.has4pc ? increased4pcPercentage : 0),
          )}% <small>of healing during totem uptime</small>
        </div>
        {this.has4pc && (
          <div className="value">
            4pc: Your critical heals have 220% effectiveness instead of the usual 200%.
          </div>
        )}
      </Statistic>
    );
  }
}

export default Season4Tier;
