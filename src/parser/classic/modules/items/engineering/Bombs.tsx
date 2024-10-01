import Abilities from 'parser/core/modules/Abilities';
import Analyzer, { Options } from 'parser/core/Analyzer';
import GEAR_SLOTS from 'game/GEAR_SLOTS';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import SPELLS from 'common/SPELLS/classic';

export default class Bombs extends Analyzer.withDependencies({ abilities: Abilities }) {
  constructor(options: Options) {
    super(options);

    const combatant = this.selectedCombatant;
    const belt = combatant._getGearItemBySlotId(GEAR_SLOTS.WAIST).onUseEnchant;
    const gloves = combatant._getGearItemBySlotId(GEAR_SLOTS.HANDS).onUseEnchant;
    const cloak = combatant._getGearItemBySlotId(GEAR_SLOTS.BACK).onUseEnchant;
    this.active =
      belt === SPELLS.NITRO_BOOSTS.enchantId ||
      gloves === SPELLS.HYPERSPEED_ACCELERATION.enchantId ||
      gloves === SPELLS.SYNAPSE_SPRINGS.enchantId ||
      cloak === SPELLS.FLEXWEAVE_UNDERLAY.enchantId;

    if (this.active) {
      this.deps.abilities.add({
        spell: SPELLS.BIG_DADDY.id,
        category: SPELL_CATEGORY.ITEMS,
        gcd: null,
      });
      this.deps.abilities.add({
        spell: SPELLS.GLOBAL_THERMAL_SAPPER_CHARGE.id,
        category: SPELL_CATEGORY.ITEMS,
        gcd: null,
      });
      this.deps.abilities.add({
        spell: SPELLS.SARONITE_BOMB.id,
        category: SPELL_CATEGORY.ITEMS,
        gcd: null,
      });
    }
  }
}
