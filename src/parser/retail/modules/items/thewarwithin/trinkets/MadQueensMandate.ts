import ITEMS from 'common/ITEMS/thewarwithin/trinkets';
import SPELLS from 'common/SPELLS/thewarwithin/trinkets';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';

export default class MadQueensMandate extends Analyzer.withDependencies({
  abilities: Abilities,
  spellUsable: SpellUsable,
}) {
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTrinket(ITEMS.MAD_QUEENS_MANDATE.id);
    if (!this.active) {
      return;
    }

    this.deps.abilities.add({
      spell: SPELLS.ABYSSAL_GLUTTONY.id,
      category: SPELL_CATEGORY.COOLDOWNS,
      cooldown: 120,
    });

    this.addEventListener(Events.damage.spell(SPELLS.ABYSSAL_GLUTTONY), this.onDamage);
  }

  private onDamage(event: DamageEvent) {
    if (event.overkill && event.overkill > 0) {
      this.spellUsable.reduceCooldown(SPELLS.ABYSSAL_GLUTTONY.id, 60000);
    }
  }
}
