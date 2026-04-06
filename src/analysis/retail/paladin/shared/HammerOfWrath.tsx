import TALENTS from 'common/TALENTS/paladin';
import Spell from 'common/SPELLS/Spell';
import SPECS from 'game/SPECS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import SPELLS from 'common/SPELLS';

class HammerofWrath extends ExecuteHelper.withDependencies({ abilities: Abilities }) {
  static executeSpells: Spell[] = [TALENTS.HAMMER_OF_WRATH_TALENT, SPELLS.HAMMER_OF_WRATH_RET];
  static executeSources: number = SELECTED_PLAYER;
  static lowerThreshold = 0.2;
  static executeOutsideRangeEnablers: Spell[] = [
    TALENTS.AVENGING_WRATH_TALENT,
    TALENTS.AVENGING_CRUSADER_TALENT,
  ];

  constructor(options: Options) {
    super(options);

    const isHoly = this.selectedCombatant.specId === SPECS.HOLY_PALADIN.id;
    const baseCD = isHoly ? 19 : 7.5;

    this.deps.abilities.add({
      spell: [TALENTS.HAMMER_OF_WRATH_TALENT.id, SPELLS.HAMMER_OF_WRATH_RET.id],
      category: SPELL_CATEGORY.ROTATIONAL,
      cooldown: (haste) => baseCD / (1 + haste),
      gcd: {
        base: 1500,
      },
    });
  }
}

export default HammerofWrath;
