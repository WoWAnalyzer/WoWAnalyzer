import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Events from 'parser/core/Events';
import SPECS from 'game/SPECS';
import Abilities from 'parser/core/modules/Abilities';

/**
 * Fires a magical projectile, tethering the enemy and any other enemies within
 * 5 yards for 10 sec, rooting them in place for 5 sec if they move more than 5
 * yards from the arrow. Example log:
 * https://www.warcraftlogs.com/reports/qZRdFv9Apg74wmMV#fight=3&type=damage-done
 */

class BindingShot extends Analyzer {

  static dependencies = {
    abilities: Abilities,
  };
  _roots = 0;
  _applications = 0;
  _casts = 0;
  category: STATISTIC_CATEGORY;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BINDING_SHOT_TALENT.id) || this.selectedCombatant.spec === SPECS.MARKSMANSHIP_HUNTER;
    this.category = this.selectedCombatant.spec === SPECS.MARKSMANSHIP_HUNTER ? STATISTIC_CATEGORY.GENERAL : STATISTIC_CATEGORY.TALENTS;
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.BINDING_SHOT_ROOT), this.onRoot);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.BINDING_SHOT_TETHER), this.onTether);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BINDING_SHOT_TALENT), this.onCast);
    if (this.active) {
      (options.abilities as Abilities).add({
        spell: SPELLS.BINDING_SHOT_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      });
    }
  }

  onTether() {
    this._applications += 1;
  }

  onRoot() {
    this._roots += 1;
  }

  onCast() {
    this._casts += 1;
  }

  statistic() {
    if (this._casts > 0) {
      return (
        <Statistic
          position={STATISTIC_ORDER.OPTIONAL(14)}
          size="flexible"
          category={this.category}
        >
          <BoringSpellValueText spell={SPELLS.BINDING_SHOT_TALENT}>
            <>
              {this._roots} <small>roots</small> / {this._applications} <small>possible</small> <br />
              {this._casts} <small>casts</small>
            </>
          </BoringSpellValueText>
        </Statistic>
      );
    } else {
      return null;
    }
  }
}

export default BindingShot;
