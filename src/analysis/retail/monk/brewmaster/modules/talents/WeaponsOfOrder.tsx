import talents from 'common/TALENTS/monk';
import { specMasteryCoefficient } from 'game/SPECS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const BASE_MASTERY_PERCENTAGE = 0.1;

class WeaponsOfOrder extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
  };

  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.WEAPONS_OF_ORDER_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.spell(talents.WEAPONS_OF_ORDER_TALENT), this._resetCooldown);
  }

  get masteryBuffPercentage() {
    return BASE_MASTERY_PERCENTAGE * (specMasteryCoefficient(this.selectedCombatant.spec) ?? 1);
  }

  protected _resetCooldown(event: CastEvent) {
    const spell = talents.KEG_SMASH_TALENT.id;
    if (spell && this.spellUsable.isOnCooldown(spell)) {
      const cd = this.abilities.getExpectedCooldownDuration(spell)!;
      this.spellUsable.reduceCooldown(spell, cd, event.timestamp);
    }
  }
}

export default WeaponsOfOrder;
