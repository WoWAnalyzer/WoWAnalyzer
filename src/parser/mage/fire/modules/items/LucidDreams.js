import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatTracker from 'parser/shared/modules/StatTracker';

const debug = false;

class LucidDreams extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
    enemies: EnemyInstances,
    statTracker: StatTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasEssence(SPELLS.LUCID_DREAMS.traitId);
    if (!this.active) {
      return;
    }
    this.hasMajor = this.selectedCombatant.hasMajor(SPELLS.LUCID_DREAMS.traitId);
    if(this.hasMajor) {
      this.abilities.add({
        spell: SPELLS.LUCID_DREAMS_MAJOR,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          },
      });
    }
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.LUCID_DREAMS_MAJOR), this.onLucidApplied);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.LUCID_DREAMS_MAJOR), this.onLucidRemoved);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.LUCID_DREAMS_MINOR_RESOURCE_REFUND), this.onLucidEnergize);
  }

  onLucidApplied(event) {
    if (!this.spellUsable.isOnCooldown(SPELLS.FIRE_BLAST.id)) {
      return;
    }
    const cdrRemaining = this.spellUsable.cooldownRemaining(SPELLS.FIRE_BLAST.id);
    const rechargeTime = ((this.selectedCombatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) ? 10 : 12) / (1 + this.statTracker.currentHastePercentage)) * 1000;
    const chargesOnCooldown = (this.selectedCombatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) ? 3 : 2) - this.spellUsable.chargesAvailable(SPELLS.FIRE_BLAST.id);
    const reduction = (rechargeTime * (chargesOnCooldown - 1)) / 2;
    debug && this.log("Fire Blast Charges on Cooldown: " + chargesOnCooldown);
    debug && this.log("Fire Blast Remaining Cooldown: " + cdrRemaining);

    if (chargesOnCooldown > 1) {
      this.spellUsable.reduceCooldown(SPELLS.FIRE_BLAST.id, reduction + (cdrRemaining / 2), event.timestamp);
    } else {
      this.spellUsable.reduceCooldown(SPELLS.FIRE_BLAST.id, cdrRemaining / 2, event.timestamp);
    }
  }

  onLucidRemoved(event) {
    const chargesOnCooldown = (this.selectedCombatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) ? 3 : 2) - this.spellUsable.chargesAvailable(SPELLS.FIRE_BLAST.id);
    const rechargeTime = ((this.selectedCombatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) ? 10 : 12) / (1 + this.statTracker.currentHastePercentage)) * 1000;
    const extension = (rechargeTime * (chargesOnCooldown - 1)) / 2;
    debug && this.log("Fire Blast Charges on Cooldown: " + chargesOnCooldown);
    debug && this.log("Fire Blast Cooldown Extension: " + extension);

    if (chargesOnCooldown > 1) {
      this.spellUsable.extendCooldown(SPELLS.FIRE_BLAST.id, extension, event.timestamp);
    }
  }

  onLucidEnergize(event) {
    const rechargeTime = ((this.selectedCombatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) ? 10 : 12) / (1 + this.statTracker.currentHastePercentage)) * 1000;
    const refund = rechargeTime / 2;
    if (this.spellUsable.isOnCooldown(SPELLS.FIRE_BLAST.id)) {
      debug && this.log("Fire Blast Cooldown Refund: " + refund);
      this.spellUsable.reduceCooldown(SPELLS.FIRE_BLAST.id, refund, event.timestamp);
    }
  }
}

export default LucidDreams;
