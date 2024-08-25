import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';

const SPELL_RESETS = [TALENTS.FROZEN_ORB_TALENT];

class SpellfrostTeachings extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(props: Options) {
    super(props);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SPELLFROST_TEACHINGS_BUFF),
      this._resetCooldowns,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SPELLFROST_TEACHINGS_BUFF),
      this._resetCooldowns,
    );
  }

  _resetCooldowns() {
    SPELL_RESETS.forEach((spell) => {
      if (this.spellUsable.isOnCooldown(spell.id)) {
        this.spellUsable.endCooldown(spell.id);
      }
    });
  }
}

export default SpellfrostTeachings;
