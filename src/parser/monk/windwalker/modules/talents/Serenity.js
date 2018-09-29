import SPELLS from 'common/SPELLS';
import SpellUsable from 'parser/core/modules/SpellUsable';
import Analyzer from 'parser/core/Analyzer';

class Serenity extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SERENITY_TALENT.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SERENITY_TALENT.id) {
      return;
    }
    if (this.spellUsable.isOnCooldown(SPELLS.RISING_SUN_KICK.id)) {
      const cooldownReduction = (this.spellUsable.cooldownRemaining(SPELLS.RISING_SUN_KICK.id)) * 0.5;
      this.spellUsable.reduceCooldown(SPELLS.RISING_SUN_KICK.id, cooldownReduction);
    }
    if (this.spellUsable.isOnCooldown(SPELLS.FISTS_OF_FURY_CAST.id)) {
      const cooldownReduction = (this.spellUsable.cooldownRemaining(SPELLS.FISTS_OF_FURY_CAST.id)) * 0.5;
      this.spellUsable.reduceCooldown(SPELLS.FISTS_OF_FURY_CAST.id, cooldownReduction);
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SERENITY_TALENT.id) {
      return;
    }
    if (this.spellUsable.isOnCooldown(SPELLS.RISING_SUN_KICK.id)) {
      const cooldownExtension = (this.spellUsable.cooldownRemaining(SPELLS.RISING_SUN_KICK.id));
      this.spellUsable.extendCooldown(SPELLS.RISING_SUN_KICK.id, cooldownExtension);
    }
    if (this.spellUsable.isOnCooldown(SPELLS.FISTS_OF_FURY_CAST.id)) {
      const cooldownExtension = (this.spellUsable.cooldownRemaining(SPELLS.FISTS_OF_FURY_CAST.id));
      this.spellUsable.extendCooldown(SPELLS.FISTS_OF_FURY_CAST.id, cooldownExtension);
    }
  }
}

export default Serenity;
