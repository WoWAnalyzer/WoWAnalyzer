import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/paladin';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const VALIANCE_CDR = 3000;

export default class Valiance extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(talents.VALIANCE_TALENT);

    this.addEventListener(Events.removebuff.spell(SPELLS.SHINING_LIGHT), this.reduceCooldown);
    this.addEventListener(Events.removebuffstack.spell(SPELLS.SHINING_LIGHT), this.reduceCooldown);
  }

  private reduceCooldown() {
    this.deps.spellUsable.reduceCooldown(talents.HOLY_ARMAMENTS_TALENT.id, VALIANCE_CDR);
  }
}
