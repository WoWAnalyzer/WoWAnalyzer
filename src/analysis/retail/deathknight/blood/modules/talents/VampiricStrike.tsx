import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import Abilities from '../Abilities';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Spell from 'common/SPELLS/Spell';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

export default class VampiricStrike extends ExecuteHelper.withDependencies({
  abilities: Abilities,
}) {
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = -1;
  static executeOutsideRangeEnablers: Spell[] = [
    SPELLS.VAMPIRIC_STRIKE_TRIGGER_BUFF,
    SPELLS.GIFT_OF_THE_SANLAYN_BUFF,
  ];
  static modifiesDamage = false;
  static executeSpells: Spell[] = [SPELLS.VAMPIRIC_STRIKE];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.VAMPIRIC_STRIKE_TALENT);

    const ctor = this.constructor as typeof ExecuteHelper;
    ctor.executeSpells.push(SPELLS.VAMPIRIC_STRIKE);

    this.deps.abilities.add({
      spell: SPELLS.VAMPIRIC_STRIKE.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      gcd: { base: 1500 },
    });
  }
}
