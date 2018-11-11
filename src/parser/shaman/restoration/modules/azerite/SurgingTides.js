import SPELLS from 'common/SPELLS';
import BaseHealerAzerite from './BaseHealerAzerite';

const HALF_HP = 0.5;

class SurgingTides extends BaseHealerAzerite {
  static TRAIT = SPELLS.SURGING_TIDES.id;
  static HEAL = SPELLS.SURGING_TIDES_ABSORB.id;

  potentialSurgingTideProcs = 0;
  currentAbsorbSize = 0;

  constructor(...args) {
    super(...args);
    this.disableStatistic = !this.hasTrait;
  }

  on_byPlayer_absorbed(event) {
    super.on_byPlayer_heal(event);
  }

  on_byPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.SURGING_TIDES_ABSORB.id) {
      return;
    }
    this.currentAbsorbSize = event.absorb || 0;
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.SURGING_TIDES_ABSORB.id) {
      return;
    }

    let absorb = event.absorb || 0;
    const healPerTrait = this.azerite.map((trait) => (this.currentAbsorbSize) * trait.healingFactor);
    for (const [index, trait] of Object.entries(this.azerite)) {
      const overhealingValue = Math.min(healPerTrait[index], absorb);
      trait.overhealing += overhealingValue;
      absorb -= overhealingValue;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.RIPTIDE.id) {
      return;
    }
    if (event.tick) {
      return;
    }

    const currentHealth = Math.max(0, (event.hitPoints - event.amount) / event.maxHitPoints);
    if (currentHealth >= HALF_HP) {
      return;
    }
    this.potentialSurgingTideProcs += 1;
  }

  get surgingTideProcsPerMinute() {
    return (this.potentialSurgingTideProcs / (this.owner.fightDuration / 1000 / 60)).toFixed(2);
  }
}

export default SurgingTides;
