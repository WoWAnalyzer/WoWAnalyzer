import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

export const EARTHSHIELD_HEALING_INCREASE = 0.2;

class ElementalOrbit extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  healing = 0;
  buffHealing = 0;
  earthShieldHealingIncrease = EARTHSHIELD_HEALING_INCREASE;
  category = STATISTIC_CATEGORY.TALENTS;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ELEMENTAL_ORBIT_TALENT);

    if (!this.active) {
      return;
    }

    // event listener for direct heals when taking damage with earth shield
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHIELD_HEAL),
      this.onEarthShieldHeal,
    );

    // event listener for healing being buffed by having earth shield on the target
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onEarthShieldAmpSpellHeal);
  }

  get elementalOrbitEarthShieldUptime() {
    return Object.values(this.combatants.players).reduce(
      (uptime, player) =>
        uptime +
        player.getBuffUptime(SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.id, this.owner.playerId),
      0,
    );
  }

  get uptimePercent() {
    return this.elementalOrbitEarthShieldUptime / this.owner.fightDuration;
  }

  onEarthShieldHeal(event: HealEvent) {
    const combatant = this.combatants.getEntity(event);
    if (
      combatant &&
      combatant.hasBuff(SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.id, event.timestamp)
    ) {
      this.healing += event.amount + (event.absorbed || 0);
    }
  }

  onEarthShieldAmpSpellHeal(event: HealEvent) {
    const combatant = this.combatants.getEntity(event);
    if (
      combatant &&
      combatant.hasBuff(SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.id, event.timestamp)
    ) {
      this.buffHealing += calculateEffectiveHealing(event, this.earthShieldHealingIncrease);
    }
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_SHAMAN.ELEMENTAL_ORBIT_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.healing + this.buffHealing),
        )} %`}
      />
    );
  }
}

export default ElementalOrbit;
