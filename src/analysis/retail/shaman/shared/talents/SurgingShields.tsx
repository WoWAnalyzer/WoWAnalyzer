import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/shaman';
import SPECS from 'game/SPECS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent, HealEvent, ResourceChangeEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';

export const EARTHSHIELD_HEALING_BONUS_PER_POINT = 0.125;
const WATERSHIELD_MANA_INCREASE_PER_POINT = 0.25;
const LIGHTNINGSHIELD_DMG_INCREASE_PER_POINT = 0.5;

class SurgingShields extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;
  //earth shield vars
  earthShieldIncrease;
  earthShieldHealing: number = 0;
  elementalOrbitEarthShieldHealing: number = 0;

  //water shield vars
  waterShieldIncrease;
  waterShieldMana: number = 0;

  //lightning shield vars
  lightningShieldIncrease;
  lightningShieldDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.SURGING_SHIELDS_TALENT);

    this.earthShieldIncrease =
      EARTHSHIELD_HEALING_BONUS_PER_POINT *
      this.selectedCombatant.getTalentRank(talents.SURGING_SHIELDS_TALENT);
    this.waterShieldIncrease =
      WATERSHIELD_MANA_INCREASE_PER_POINT *
      this.selectedCombatant.getTalentRank(talents.SURGING_SHIELDS_TALENT);
    this.lightningShieldIncrease =
      LIGHTNINGSHIELD_DMG_INCREASE_PER_POINT *
      this.selectedCombatant.getTalentRank(talents.SURGING_SHIELDS_TALENT);
    const isEle = this.selectedCombatant.specId === SPECS.ELEMENTAL_SHAMAN.id;
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHIELD_HEAL),
      this.onEarthShieldHeal,
    );

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.WATER_SHIELD_ENERGIZE),
      this.onWaterShieldEnergize,
    );

    if (!isEle) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.LIGHTNING_SHIELD),
        this.onLightningShieldDmg,
      );
    } else {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.LIGHTNING_SHIELD_ELEMENTAL),
        this.onLightningShieldDmg,
      );
    }
  }

  onEarthShieldHeal(event: HealEvent) {
    const combatant = this.combatants.getEntity(event);
    if (!combatant) {
      return;
    }
    if (combatant.hasBuff(talents.EARTH_SHIELD_TALENT.id, event.timestamp)) {
      this.earthShieldHealing += calculateEffectiveHealing(event, this.earthShieldIncrease);
    } else if (combatant.hasBuff(SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.id, event.timestamp)) {
      this.elementalOrbitEarthShieldHealing += calculateEffectiveHealing(
        event,
        this.earthShieldIncrease,
      );
    }
  }

  onWaterShieldEnergize(event: ResourceChangeEvent) {
    this.waterShieldMana += event.resourceChange - event.resourceChange / this.waterShieldIncrease;
  }

  onLightningShieldDmg(event: DamageEvent) {
    this.lightningShieldDamage += calculateEffectiveDamage(event, this.lightningShieldIncrease);
  }
}

export default SurgingShields;
