import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import Analyzer from 'parser/core/Analyzer';
import SpellHistory from 'parser/shared/modules/SpellHistory';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const BREWS = [
  talents.BLACK_OX_BREW_TALENT,
  SPELLS.FORTIFYING_BREW_BRM,
  talents.CELESTIAL_BREW_TALENT,
  talents.PURIFYING_BREW_TALENT,
];

class SharedBrews extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    spellHistory: SpellHistory,
  };

  protected spellUsable!: SpellUsable;
  protected spellHistory!: SpellHistory;

  // reduces the cooldown of the (fake) ISB/PB in SpellUsable, returning the amount by
  // which the CD was reduced (0 if it was not on cooldown)
  //
  // also reduces BoB & FB cooldowns
  reduceCooldown(amount: number) {
    BREWS.slice(0, -1)
      .filter((spell) => this.spellUsable.isOnCooldown(spell.id))
      .forEach((spell) => this.spellUsable.reduceCooldown(spell.id, amount));

    const finalBrew = BREWS[BREWS.length - 1];
    if (!this.spellUsable.isOnCooldown(finalBrew.id)) {
      return 0;
    }
    return this.spellUsable.reduceCooldown(finalBrew.id, amount);
  }
}

export default SharedBrews;
