import Analyzer, { Options } from 'src/parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Combatants from 'parser/shared/modules/Combatants';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import SPELLS from 'src/common/SPELLS/midnight/engineering';
//import Events, { CastEvent } from 'parser/core/Events';

/**
 * Abstract class for battle-res items.
 * There are two different categories of battle resurrection abilities that share cooldown:
 * Engeneering items and class-specific battle resurrection abilities(like Rebirth or Soulstone).
 * All share the same 6 minute cooldown but each additional class-specific ability reduces the shared cooldown.
 * Items do not reduce the cooldown but trigger it upon cast-success event.
 *
 * @property {Abilities} abilities
 * @property {SpellUsable} spellUsable
 * @property {AbilityTracker} abilityTracker
 */

export default class EmergencySoulLink extends Analyzer.withDependencies({
  abilities: Abilities,
  combatants: Combatants,
}) {
  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;
  protected abilityTracker!: AbilityTracker;

  baseCooldown = 600; //Battle-Res timer in seconds
  //baseCastTimeR1 = 6;
  //baseCastTimeR2 = 3;

  protected shouldActivate(options: Options) {
    return true;
  }

  constructor(options: Options) {
    super(options);
    this.active = this.shouldActivate(options);

    if (!this.active) {
      return;
    }

    this.deps.abilities.add({
      spell: SPELLS.EMERGENCY_SOUL_LINK.id,
      category: SPELL_CATEGORY.CONSUMABLE,
      cooldown: this.baseCooldown,
      gcd: null,
    });
  }
}
