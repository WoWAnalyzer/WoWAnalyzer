import SPELLS from 'common/SPELLS/classic/warlock';
import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Abilities from 'parser/core/modules/Abilities';

export default class Metamorphosis extends Analyzer.withDependencies({ abilities: Abilities }) {
  constructor(options: Options) {
    super(options);
    // Meta spells are not in the generated spell list
    this.deps.abilities.add({
      category: SPELL_CATEGORY.ROTATIONAL,
      spell: [SPELLS.CHAOS_WAVE.id],
      name: SPELLS.CHAOS_WAVE.name,
      gcd: { base: 1000 },
    });
    this.deps.abilities.add({
      category: SPELL_CATEGORY.ROTATIONAL,
      spell: [SPELLS.DOOM.id],
      name: SPELLS.DOOM.name,
      gcd: { base: 1000 },
    });
    this.deps.abilities.add({
      category: SPELL_CATEGORY.ROTATIONAL,
      spell: [SPELLS.IMMOLATION_AURA.id],
      name: SPELLS.IMMOLATION_AURA.name,
      gcd: { base: 1000 },
    });
    this.deps.abilities.add({
      category: SPELL_CATEGORY.ROTATIONAL,
      spell: [SPELLS.TOUCH_OF_CHAOS.id],
      name: SPELLS.TOUCH_OF_CHAOS.name,
      gcd: { base: 1000 },
    });
    this.deps.abilities.add({
      category: SPELL_CATEGORY.ROTATIONAL,
      spell: [SPELLS.SOUL_FIRE_META.id],
      name: SPELLS.SOUL_FIRE_META.name,
      gcd: { base: 1000 },
    });
  }
}
