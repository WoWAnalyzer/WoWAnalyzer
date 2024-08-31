import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from 'common/SPELLS/classic/druid';

/**
 * Shooting Stars (talent) gives a chance to reset the CD of Starsurge
 */

const SPELL_RESETS = [SPELLS.STARSURGE];

class ShootingStars extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(props: Options) {
    super(props);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell({ id: SPELLS.SHOOTING_STARS.id }),
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

export default ShootingStars;
