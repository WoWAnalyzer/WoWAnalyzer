import TALENTS from 'common/TALENTS/paladin';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';

class UnbreakableSpirit extends Analyzer.withDependencies({
  abilities: Abilities,
}) {
  private static readonly AFFECTED_SPELL_IDS = [
    SPELLS.DIVINE_SHIELD.id,
    TALENTS.ARDENT_DEFENDER_TALENT.id,
    TALENTS.LAY_ON_HANDS_TALENT.id,
  ];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.UNBREAKABLE_SPIRIT_TALENT);
    if (!this.active) {
      return;
    }

    UnbreakableSpirit.AFFECTED_SPELL_IDS.forEach((spellId) => {
      const ability = this.deps.abilities.getAbility(spellId);
      if (ability) {
        const baseCooldown = ability.getCooldown(0);
        ability.cooldown = Math.round(baseCooldown * 0.7);
      }
    });
  }
}

export default UnbreakableSpirit;
