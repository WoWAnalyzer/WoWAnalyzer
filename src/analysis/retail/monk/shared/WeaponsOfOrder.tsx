import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import SPECS from 'game/SPECS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const BASE_MASTERY_PERCENTAGE = 0.1;

const RESET_COOLDOWN = {
  [SPECS.MISTWEAVER_MONK.id]: SPELLS.ESSENCE_FONT.id,
  [SPECS.BREWMASTER_MONK.id]: SPELLS.KEG_SMASH.id,
};

class WeaponsOfOrder extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
  };

  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.KYRIAN.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.spell(SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL),
      this._resetCooldown,
    );

    (options.abilities as Abilities).add({
      spell: SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id,
      category: SPELL_CATEGORY.COOLDOWNS,
      cooldown: 120,
      // WoO is hasted for WW/BrM for whatever fucking reason
      gcd: this.selectedCombatant.spec === SPECS.MISTWEAVER_MONK ? { base: 1500 } : { base: 1000 },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.9,
      },
    });
  }

  get masteryBuffPercentage() {
    return BASE_MASTERY_PERCENTAGE * (this.selectedCombatant.spec?.masteryCoefficient || 1);
  }

  protected _resetCooldown(event: CastEvent) {
    const spell = RESET_COOLDOWN[this.selectedCombatant.specId];
    if (spell && this.spellUsable.isOnCooldown(spell)) {
      const cd = this.abilities.getExpectedCooldownDuration(spell)!;
      this.spellUsable.reduceCooldown(spell, cd, event.timestamp);
    }
  }
}

export default WeaponsOfOrder;
